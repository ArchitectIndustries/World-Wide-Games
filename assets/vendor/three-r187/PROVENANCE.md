# Three.js r187

Source: https://github.com/mrdoob/three.js/releases/tag/r187

Package: `three@0.187.0`, from https://registry.npmjs.org/three/-/three-0.187.0.tgz. Verified November 26, 2026. Archive size: 4,795,351 bytes. Archive SHA-256: `ff540832ded0cfe919764d24a3d88f3e2a05f23303f876423e4f893841e90728`. Registry SHA-1: `face29ee2de9bcc31a1b573a76f224e35e0b2894`. Three.js authors retain their MIT copyright; see LICENSE.

The build downloads the pinned public npm archive only when verified local generated files are absent or invalid. A bounded, checksummed tar reader extracts only `package/build/three.module.js` and `package/build/three.core.js`. Both files are the **original unmodified, unminified upstream modules**, including their original legal comments and relative import. No package installation, minifier or third-party dependency is required for this preparation step.

- `three.core.js` — 1,474,799 bytes; SHA-256 `613e370f76638fdef83926642bf256dc9615684922de1ce1f63a8583e5d78578`.
- `three.module.js` — 658,900 bytes; SHA-256 `104f56145899722094556490d787aae0617cc2fc3382f31df02d724ea1aee341`.

The precise approved URLs, sizes and hashes are tracked in `tools/asset-sources.json`, and preparation is implemented by `tools/fetch-public-assets.mjs`. Clean builds require access to the public provider; failed status, timeout, size or hash checks stop the build before publishing. The finished site serves these modules locally and makes no runtime CDN or npm request.
