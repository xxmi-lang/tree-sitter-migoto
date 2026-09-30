# XXMI changes

This fork of [lupomikti/tree-sitter-migoto](https://github.com/lupomikti/tree-sitter-migoto) tracks
the XXMI dialect of 3DMigoto `.ini` files for [xxmi-lang](https://github.com/xxmi-lang/xxmi-lang).
Upstream's copyright and MIT license are unchanged; our changes are MIT as well.

Rules for changes in this fork:

- One construct per commit, each with a `test/corpus/xxmi.txt` case.
- No reformatting of unrelated grammar code; node names stay compatible with upstream queries.
- Every change cites where the XXMI DLL defines the construct
  (`SpectrumQT/XXMI-Libs-Package`, checked at commit `34fa32f`).
- Upstream `main` is merged monthly (see `.github/workflows/upstream-sync.yml`).
  Resolve conflicts in favor of upstream's structure, then re-apply these fixes.

## Changes

### 1. `,` ends a custom resource identifier

- **Construct:** `store = $store_temp, Resource.UAV, 7` (ZZMI `Libraries/HP bar/hp.ini`).
  The external scanner's `scan_custom_resource_identifier` read `.UAV,` as the resource name,
  so the `store` argument list never closed.
- **DLL source:** `DirectX11/CommandList.cpp`, `ParseStoreCommand` reads arguments with
  `CommandArgumentReader`; `CommandArgumentReader::GetTokenInternal` stops a token at `,`
  outside brackets (`PeekMode::Token`, declared in `CommandList.h`).
- **Fix:** `src/scanner.c`, `,` is a terminal in `scan_custom_resource_identifier`.
  Section names already exclude `,` (`custom_section_name` in `grammar.js`).
- **Test:** `test/corpus/xxmi.txt`, "XXMI: store with custom resource source".

### 2. `DXGI_FORMAT_*` and `D3D11_BIND_*` operands end at identifier characters

- **Construct:** `($format == DXGI_FORMAT_R16_TYPELESS || $format == DXGI_FORMAT_R16_FLOAT)`
  (ZZMI `Libraries/SlotFix/Matches.ini`). `_resource_format` was `/DXGI_FORMAT_.+/`, which ate
  the rest of the line (`)`, `||`, …), so the whole file failed to parse. `bind_flag` had the same
  pattern.
- **DLL source:** `DirectX11/CommandList.cpp`, `tokenise()` ends a non-prefixed operand at
  `FindIdentifierTokenEnd` (`is_identifier_char`: `[a-z0-9_]`, case-insensitive).
- **Fix:** `grammar.js`, `_resource_format: /DXGI_FORMAT_[a-z0-9_]+/i` and
  `bind_flag: /D3D11_BIND_[a-z0-9_]+/i`.
- **Test:** `test/corpus/xxmi.txt`, "XXMI: DXGI format and bind flag operands end at identifier
  characters".
- **Note:** the doc listed this gap as "multi-segment namespace?". `namespace = SlotFix\Matches`
  parses fine; the format operand was the cause.

### 3. A pool without an index is a resource operand

- **Construct:** `Poolt = null` (ZZMI `Libraries/SlotFix/SlotFix.ini`, line 983). The same gap
  broke `PoolFoo->Size`. `resource_pool` always required an `[index]`; only `@PoolFoo`/`#PoolFoo`
  allowed the bare form.
- **DLL source:** `DirectX11/CommandList.cpp`, `ResourceCopyTarget::ParseTargetPool`:
  "No pool index specified, treat target as non-evaluatable pool" (`ResourceCopyTargetType::POOL`),
  and "Treat #PoolName and PoolName->Size as POOL_SIZE".
- **Fix:** `grammar.js`, new hidden `_whole_resource_pool` (an alias of `_resource_pool_base` to
  `resource_pool`, so queries see the same node) in `_resource_operand` and
  `_limited_resource_operand`.
- **Test:** `test/corpus/xxmi.txt`, "XXMI: pool without an index targets the whole pool".
- **Note:** the doc attributed this gap to `$Poolt[*] = …`. The wildcard already parsed; the line
  before it was the cause.
