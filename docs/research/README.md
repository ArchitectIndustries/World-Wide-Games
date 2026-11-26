# Structured source research

`GAME_SOURCE_LIBRARY.json.gz` losslessly preserves the complete original structured source library. It is a source and provenance reference, separate from the application runtime.

Original uncompressed bytes: 896107

Original SHA-256: `c27f913c23ac9fde7855f131bcdbe63e2440527da837c7fdc0a2aa9156019ce2`

```sh
gzip -dc docs/research/GAME_SOURCE_LIBRARY.json.gz > GAME_SOURCE_LIBRARY.json
sha256sum GAME_SOURCE_LIBRARY.json
```

The transfer uses a deterministic gzip stream (mtime zero). Decompression was verified byte for byte against the recovered original. No research entry or field was omitted.
