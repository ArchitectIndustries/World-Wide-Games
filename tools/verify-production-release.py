#!/usr/bin/env python3
"""Read-only World Wide Games deployment verification against a built dist.

No requests are made merely by importing this module. The CLI defaults to the
existing production origin; --local-only validates the artifact without HTTP.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import pathlib
import re
import time
import urllib.error
import urllib.parse
import urllib.request

PRODUCTION_BASE = "https://worldwidegames.vercel.app/"
PUBLIC_ROOTS = {"assets", "covers", "games", "js"}
PUBLIC_FILES = {"index.html", "game.html", "manifest.webmanifest", "sw.js", "LICENSE", "THIRD_PARTY_NOTICES.md"}
PRIVATE_ROOTS = {"tests", "tools", "services", "docs", "source-assets", ".github", ".git"}
PRIVATE_FILES = {"README.md", "PROJECT_STATE.md", "TEST_REPORT.md", "RELEASE_RECORD.json", "RELEASE_NOTES.md", "DEVELOPMENT_STANDARDS.md", "AGENTS.md", "package.json", "package-lock.json", "vercel.json"}
PRIVATE_PROBES = (
    "README.md", "PROJECT_STATE.md", "TEST_REPORT.md", "RELEASE_RECORD.json",
    "RELEASE_NOTES.md", "DEVELOPMENT_STANDARDS.md", "AGENTS.md", "package.json",
    "package-lock.json", "vercel.json", "tests/recovery-release.test.cjs",
    "tools/build-public.mjs", "tools/fetch-public-assets.mjs", "tools/asset-sources.json",
    "tools/assemble-assets.mjs", "tools/asset-parts.json", "source-assets/",
    "services/cyber_wars/relay.py", "docs/Aegis-3D-upgrade.md",
    ".github/workflows/deploy.yml", ".git/config",
)
REQUEST_HEADERS = {
    "Cache-Control": "no-cache, no-store, max-age=0",
    "Pragma": "no-cache",
    "Accept-Encoding": "identity",
    "Accept": "*/*",
    "User-Agent": "WorldWideGames-ReleaseVerifier/2",
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def parse_json(data):
    def unique(pairs):
        obj = {}
        for key, value in pairs:
            require(key not in obj, "Duplicate JSON key: " + key)
            obj[key] = value
        return obj
    return json.loads(data, object_pairs_hook=unique)


def valid_public_path(value):
    require(isinstance(value, str) and value, "Invalid public path")
    require(not any(c in value for c in "\\?#%") and not any(ord(c) < 32 or ord(c) == 127 for c in value), "Noncanonical public path: " + value)
    parts = value.split("/")
    require(all(part and part not in {".", ".."} and not part.startswith(".") for part in parts), "Unsafe public path: " + value)
    require(value in PUBLIC_FILES or (parts[0] in PUBLIC_ROOTS and len(parts) > 1), "Engineering/nonpublic receipt path: " + value)
    require(parts[0] not in PRIVATE_ROOTS and value not in PRIVATE_FILES, "Private receipt path: " + value)
    return value


def load_local(dist, expected_version, expected_catalog=None):
    dist = pathlib.Path(dist)
    require(not dist.is_symlink(), "Local dist must not be a symlink")
    dist = dist.resolve(strict=True)
    receipt_bytes = (dist / "release.json").read_bytes()
    receipt = parse_json(receipt_bytes)
    require(receipt.get("version") == expected_version, "Local receipt version differs from expected version")
    hashes = receipt.get("sha256")
    require(isinstance(hashes, dict) and hashes, "Local receipt has no public hash inventory")
    require(type(receipt.get("publicFileCount")) is int and receipt["publicFileCount"] == len(hashes), "Local publicFileCount is inconsistent")
    games = receipt.get("games")
    require(isinstance(games, list) and games, "Local receipt has no catalog")
    require(type(receipt.get("catalogCount")) is int and receipt["catalogCount"] == len(games), "Local catalog count is inconsistent")
    if expected_catalog is not None:
        require(receipt["catalogCount"] == expected_catalog, "Local catalog count differs from --catalog-count")
    require(len({g.get("id") for g in games}) == len(games), "Duplicate local game IDs")
    for game in games:
        require(isinstance(game.get("id"), str) and game["id"] and isinstance(game.get("version"), str) and game["version"], "Invalid local catalog entry")
        require(valid_public_path(game.get("path")) in hashes, "Catalog game is absent from public receipt: " + game["id"])
    actual_paths = set()
    for file in dist.rglob("*"):
        require(not file.is_symlink(), "Symlink in local artifact: " + str(file))
        if file.is_file():
            actual_paths.add(file.relative_to(dist).as_posix())
    require(actual_paths == set(hashes) | {"release.json"}, "Local dist inventory differs from receipt; extra=" + repr(sorted(actual_paths - set(hashes) - {"release.json"})) + "; missing=" + repr(sorted(set(hashes) - actual_paths)))
    content = {}
    for path, expected_hash in sorted(hashes.items()):
        valid_public_path(path)
        require(isinstance(expected_hash, str) and re.fullmatch(r"[0-9a-f]{64}", expected_hash), "Invalid local SHA-256: " + path)
        data = (dist / path).read_bytes()
        require(sha256(data) == expected_hash, "Local file differs from its receipt: " + path)
        content[path] = data
    worker = content.get("sw.js", b"").decode("utf-8")
    cache = receipt.get("cache")
    require(isinstance(cache, str) and re.fullmatch("wwg-" + re.escape(expected_version) + r"(?:-f3d[0-9]+|-[0-9a-f]{12})?", cache), "Local cache key does not identify expected version")
    require("const CACHE='" + cache + "';" in worker, "Local worker cache key differs from receipt")
    match = re.search(r"const ASSETS\s*=\s*(\[[\s\S]*?\]);", worker)
    require(match is not None, "Local worker has no public inventory")
    cache_paths = parse_json(match.group(1))
    require(isinstance(cache_paths, list) and len(cache_paths) == len(set(cache_paths)), "Local worker inventory is invalid or duplicated")
    for item in cache_paths:
        require(isinstance(item, str) and item.startswith("./"), "Nonlocal cache entry: " + repr(item))
        url = urllib.parse.urlsplit(item)
        require(not url.scheme and not url.netloc and not url.fragment, "Invalid cache URL: " + item)
        path = urllib.parse.unquote(url.path[2:]) or "index.html"
        require(valid_public_path(path) in content, "Cache entry is not in public artifact: " + item)
    return receipt, content, {
        "path": str(dist), "receiptSha256": sha256(receipt_bytes),
        "commit": receipt.get("commit"), "sourceDirty": receipt.get("sourceDirty"),
        "files": len(content), "bytes": sum(map(len, content.values())),
        "catalogCount": len(games), "cacheEntries": len(cache_paths), "cache": cache,
    }


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, newurl):
        return None


def fetch(base_url, relative, timeout, deadline, limit=4 * 1024 * 1024, status_only=False):
    remaining = deadline - time.monotonic()
    require(remaining > 0, "Overall verification deadline exceeded")
    url = base_url.rstrip("/") + "/" + urllib.parse.quote(relative, safe="/.")
    request = urllib.request.Request(url, headers=REQUEST_HEADERS, method="GET")
    # Do not let a redirect silently substitute another release or a generic page.
    opener = urllib.request.build_opener(NoRedirect())
    try:
        response = opener.open(request, timeout=min(timeout, remaining))
    except urllib.error.HTTPError as error:
        response = error
    with response:
        status = response.code
        headers = {key: response.headers.get(key) for key in ("Cache-Control", "Age", "ETag", "X-Vercel-Cache") if response.headers.get(key) is not None}
        if status_only:
            return status, b"", headers
        chunks, size = [], 0
        read = getattr(response, "read1", response.read)
        while size <= limit:
            require(time.monotonic() < deadline, "Overall verification deadline exceeded")
            chunk = read(min(65536, limit + 1 - size))
            if not chunk:
                break
            chunks.append(chunk)
            size += len(chunk)
        require(size <= limit, "Response exceeds expected byte limit: " + relative)
        return status, b"".join(chunks), headers


def receipt_mismatches(live, local, expected_version, expected_commit):
    failures = []
    if live.get("version") != expected_version:
        failures.append("Live version differs from expected: " + repr(live.get("version")))
    if live.get("commit") != expected_commit:
        failures.append("Live commit differs from expected: " + repr(live.get("commit")))
    if live.get("sourceDirty") is not False:
        failures.append("Live receipt does not identify a clean deployment")
    for field in ("catalogCount", "games", "cache", "publicFileCount", "sha256", "owner", "date", "sourceTracks"):
        if live.get(field) != local.get(field):
            failures.append("Live receipt field differs from local artifact: " + field)
    return failures


def verify_release(expected_version, expected_commit, dist, *, catalog_count=None,
                   workers=8, timeout=20.0, deadline_seconds=360.0,
                   local_only=False, base_url=PRODUCTION_BASE, private_probes=PRIVATE_PROBES):
    started = time.monotonic()
    deadline = started + deadline_seconds
    result = {
        "ok": False, "mode": "local-only" if local_only else "production",
        "url": base_url, "expectedVersion": expected_version, "expectedCommit": expected_commit,
        "workers": workers, "timeoutSeconds": timeout, "deadlineSeconds": deadline_seconds,
        "receiptVerified": False, "receiptStable": False,
        "filesChecked": 0, "filesMatched": 0, "bytesChecked": 0,
        "privateRoutesChecked": 0, "privateRoutesExcluded": 0,
        "failures": [], "files": [], "privateRoutes": [], "phase": "local-validation",
    }
    try:
        require(re.fullmatch(r"(?:[0-9a-f]{40}|[0-9a-f]{64})", expected_commit), "Expected commit must be a complete lowercase Git SHA")
        require(1 <= workers <= 16 and 0 < timeout <= 60 and 0 < deadline_seconds <= 1800, "Invalid concurrency/timeout limits")
        local, content, summary = load_local(dist, expected_version, catalog_count)
        result["local"] = summary
        result["catalogCount"] = local["catalogCount"]
        result["cache"] = local["cache"]
        if local_only:
            result["ok"] = True
            result["phase"] = "local-complete"
            return result
        result["phase"] = "release-receipt"
        status, initial_receipt, headers = fetch(base_url, "release.json", timeout, deadline)
        require(status == 200, "Live release.json HTTP status: " + str(status))
        live = parse_json(initial_receipt)
        require(isinstance(live, dict), "Live receipt is not an object")
        result["live"] = {key: live.get(key) for key in ("version", "commit", "catalogCount", "cache", "publicFileCount", "sourceDirty")}
        result["receiptHeaders"] = headers
        differences = receipt_mismatches(live, local, expected_version, expected_commit)
        require(not differences, "; ".join(differences))
        result["receiptVerified"] = True
        result["phase"] = "public-files-and-exclusions"

        def public_file(path):
            expected = content[path]
            row = {"path": path, "expectedBytes": len(expected), "match": False}
            try:
                status, data, _ = fetch(base_url, path, timeout, deadline, limit=len(expected) + 1)
                digest = sha256(data)
                row.update(status=status, bytes=len(data), sha256=digest)
                row["match"] = status == 200 and data == expected and digest == local["sha256"][path]
                if not row["match"]:
                    row["error"] = "HTTP status, byte content or SHA-256 differs from local artifact"
            except Exception as error:
                row["error"] = str(error)
            return "public", row

        def private_path(path):
            row = {"path": path, "excluded": False}
            try:
                status, _, _ = fetch(base_url, path, timeout, deadline, status_only=True)
                row.update(status=status, excluded=status in {403, 404, 410})
                if not row["excluded"]:
                    row["error"] = "Private engineering route did not return 403, 404 or 410"
            except Exception as error:
                row["error"] = str(error)
            return "private", row

        pool = concurrent.futures.ThreadPoolExecutor(max_workers=workers)
        futures = {pool.submit(public_file, p): ("public", p) for p in content}
        futures.update({pool.submit(private_path, p): ("private", p) for p in private_probes})
        seen = set()
        try:
            for future in concurrent.futures.as_completed(futures, timeout=max(.001, deadline - time.monotonic())):
                seen.add(future)
                kind, row = future.result()
                result["files" if kind == "public" else "privateRoutes"].append(row)
        except concurrent.futures.TimeoutError:
            for future, (kind, path) in futures.items():
                if future not in seen:
                    future.cancel()
                    row = {"path": path, "error": "Overall verification deadline exceeded", "match" if kind == "public" else "excluded": False}
                    result["files" if kind == "public" else "privateRoutes"].append(row)
        finally:
            # Running requests still have the bounded socket timeout; queued work is cancelled.
            pool.shutdown(wait=True, cancel_futures=True)
        result["files"].sort(key=lambda row: row["path"])
        result["privateRoutes"].sort(key=lambda row: row["path"])
        result["filesChecked"] = len(result["files"])
        result["filesMatched"] = sum(row["match"] for row in result["files"])
        result["bytesChecked"] = sum(row.get("bytes", 0) for row in result["files"])
        result["privateRoutesChecked"] = len(result["privateRoutes"])
        result["privateRoutesExcluded"] = sum(row["excluded"] for row in result["privateRoutes"])
        result["failures"].extend({"phase": "public-file", **row} for row in result["files"] if not row["match"])
        result["failures"].extend({"phase": "private-route", **row} for row in result["privateRoutes"] if not row["excluded"])
        result["phase"] = "receipt-stability"
        status, final_receipt, _ = fetch(base_url, "release.json", timeout, deadline)
        result["receiptStable"] = status == 200 and final_receipt == initial_receipt
        require(result["receiptStable"], "Deployment receipt changed during verification")
        result["phase"] = "complete"
        result["ok"] = not result["failures"]
    except Exception as error:
        result["failures"].append({"phase": result["phase"], "error": str(error)})
    finally:
        result["elapsedSeconds"] = round(time.monotonic() - started, 3)
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version", required=True, help="Exact release version, for example v498")
    parser.add_argument("--commit", required=True, help="Exact full deployed Git commit SHA")
    parser.add_argument("--dist", required=True, type=pathlib.Path, help="Reviewed local built artifact")
    parser.add_argument("--catalog-count", type=int, help="Optional additional expected catalog count; otherwise the local receipt is authoritative")
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--timeout", type=float, default=20, help="Per-request socket timeout, maximum 60 seconds")
    parser.add_argument("--deadline", type=float, default=360, help="Overall scheduling/read budget, maximum 1800 seconds")
    parser.add_argument("--local-only", action="store_true", help="Validate only local bytes/receipt/cache; make no HTTP requests")
    parser.add_argument("--output", type=pathlib.Path, help="Full JSON evidence path; concise summary is printed")
    args = parser.parse_args(argv)
    result = verify_release(args.version, args.commit, args.dist, catalog_count=args.catalog_count,
                            workers=args.workers, timeout=args.timeout, deadline_seconds=args.deadline,
                            local_only=args.local_only)
    output = args.output or pathlib.Path.cwd() / ("production-verification-" + re.sub(r"[^a-zA-Z0-9._-]", "_", args.version) + "-" + args.commit[:12] + ".json")
    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(output.name + ".tmp")
    temporary.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    temporary.replace(output)
    summary = {key: value for key, value in result.items() if key not in {"files", "privateRoutes", "failures"}}
    summary.update(failureCount=len(result["failures"]), failures=result["failures"][:12], report=str(output))
    print(json.dumps(summary, separators=(",", ":")))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
