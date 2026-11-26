#!/usr/bin/env python3
"""Stage a fresh static recovery payload; never deploy or change source.
Explicitly retain legacy static routes and license/provenance notices. New file
kinds require review instead of silently publishing arbitrary source files.
"""
import argparse, hashlib, json, re, shutil
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT_FILES = ('index.html', 'game.html', 'sw.js', 'manifest.webmanifest',
              'vercel.json', 'LICENSE', 'THIRD_PARTY_NOTICES.md')
PUBLIC_DIRS = ('assets', 'covers', 'games', 'js')
EXTENSIONS = {'.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp',
              '.ico', '.woff', '.woff2', '.ogg', '.mp3', '.wav', '.wasm'}
NOTICE_NAMES = {'PROVENANCE.md', 'LICENSE', 'LICENSE.txt', 'NOTICE', 'NOTICE.txt'}

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def precache_urls(root):
    # The first-party service worker declares this as a literal array.
    src = (root / 'sw.js').read_text(encoding='utf-8')
    match = re.search(r'const ASSETS\s*=\s*\[(.*?)\];', src, re.S)
    if not match:
        raise ValueError('Missing literal ASSETS array; review public inventory')
    body = re.sub(r'^\s*//[^\n]*$', '', match.group(1), flags=re.M)
    urls = json.loads('[' + body + ']')
    if not isinstance(urls, list) or len(set(urls)) != len(urls):
        raise ValueError('Malformed or duplicate precache URLs')
    return urls

def asset_file(url):
    if not isinstance(url, str) or not url.startswith('./'):
        raise ValueError(f'Invalid precache path: {url!r}')
    u = urlsplit(url)
    p = unquote(u.path[2:])
    if u.netloc or u.scheme or u.fragment or '\\' in p or any(x in ('..', '.') for x in p.split('/')):
        raise ValueError(f'Invalid precache path: {url!r}')
    if not p or p.endswith('/'):
        p += 'index.html'
    if any(not x or x.startswith('.') for x in p.split('/')):
        raise ValueError(f'Invalid precache path: {url!r}')
    return p

def inventory(root):
    root = Path(root).resolve()
    paths = set()
    def include(p):
        if p.is_symlink() or not p.is_file() or not p.resolve().is_relative_to(root):
            raise ValueError(f'Not a regular in-tree public file: {p}')
        rel = p.relative_to(root).as_posix()
        if any(x.startswith('.') for x in rel.split('/')):
            raise ValueError(f'Unexpected hidden public path: {rel}')
        paths.add(rel)
    for name in ROOT_FILES:
        include(root / name)
    for name in PUBLIC_DIRS:
        directory = root / name
        if directory.is_symlink() or not directory.is_dir():
            raise ValueError(f'Missing or symlinked public directory: {name}')
        for p in directory.rglob('*'):
            if p.is_symlink():
                raise ValueError(f'Unexpected symlink: {p}')
            if p.is_dir():
                continue
            if p.suffix.lower() not in EXTENSIONS and p.name not in NOTICE_NAMES:
                raise ValueError(f'Unreviewed public file type: {p.relative_to(root)}')
            include(p)
    required = {asset_file(x) for x in precache_urls(root)}
    missing = required - paths
    if missing:
        raise ValueError(f'Precache assets absent from public inventory: {sorted(missing)}')
    return sorted(paths)

def stage(root, dest):
    root = Path(root).resolve(); dest = Path(dest).resolve()
    if dest.exists() or dest.is_relative_to(root) or root.is_relative_to(dest):
        raise ValueError('Destination must be a new directory outside source tree')
    files = inventory(root)
    dest.mkdir(parents=True, exist_ok=False)
    try:
        for rel in files:
            target = dest / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(root / rel, target)
            if digest(root / rel) != digest(target):
                raise ValueError(f'Copy verification failed: {rel}')
        return {'fileCount': len(files), 'bytes': sum((dest / p).stat().st_size for p in files),
                'files': {p: digest(dest / p) for p in files}}
    except BaseException:
        shutil.rmtree(dest)
        raise

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    print(json.dumps(stage(args.source, args.destination), indent=2, sort_keys=True))
