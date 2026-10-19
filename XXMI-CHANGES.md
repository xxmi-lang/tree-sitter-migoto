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

Upstream 0.9.4 (merged here on 2026-10-19) fixed changes 1–4 in its own way: `0c1ac03` (1),
`b0e0ebb` (2), `a4ff97c` (3 and 4). Their tests below still pass on upstream's code. The one piece
re-applied on top is in change 3: upstream accepts a bare pool through the hidden
`_resource_pool_base`, which leaves no `resource_pool` node, so we alias it
(`_bare_resource_pool`), as upstream already does for `@Pool`/`#Pool`. xxmi-lang reads
`resource_pool` nodes as pool references.

### 1. `,` ends a custom resource identifier (upstream since 0.9.4)

- **Construct:** `store = $store_temp, Resource.UAV, 7` (ZZMI `Libraries/HP bar/hp.ini`).
  The external scanner's `scan_custom_resource_identifier` read `.UAV,` as the resource name,
  so the `store` argument list never closed.
- **DLL source:** `DirectX11/CommandList.cpp`, `ParseStoreCommand` reads arguments with
  `CommandArgumentReader`; `CommandArgumentReader::GetTokenInternal` stops a token at `,`
  outside brackets (`PeekMode::Token`, declared in `CommandList.h`).
- **Fix:** `src/scanner.c`, `,` is a terminal in `scan_custom_resource_identifier`.
  Section names already exclude `,` (`custom_section_name` in `grammar.js`).
- **Test:** `test/corpus/xxmi.txt`, "XXMI: store with custom resource source".

### 2. `DXGI_FORMAT_*` and `D3D11_BIND_*` operands end at identifier characters (upstream since 0.9.4)

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

### 3. A pool without an index is a resource operand (upstream since 0.9.4, alias re-applied)

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

### 4. A resource copy source may carry a member suffix (upstream since 0.9.4)

- **Construct:** `ResourceUIPlacementQuad = copy vb0->Region($offset, 4 * $stride)`
  (ZZMI `Libraries/TTLib/UIPlacement.ini`, line 203). `resource_usage_expression` only accepted a
  plain resource operand.
- **DLL source:** `DirectX11/CommandList.cpp`, `ResourceCopyTarget::ParseTarget` consumes "an
  optional resource member suffix (e.g. `->HashRegion(0, 16)` or `->Length`)" via
  `ResourceCopyTarget::ParseTargetMember` (member table: `->region`, `->hashregion`, …) before
  resolving the resource. `SpecialCopyBufferRegion` and the `cs-cb0 = ref vs-cb0->Region(...)`
  comment show the copy/ref use.
- **Fix:** `grammar.js`, `resource_usage_expression` accepts `property_access_expression` as its
  operand.
- **Test:** `test/corpus/xxmi.txt`, "XXMI: resource copy source with a member suffix".
- **Note:** the doc also listed `local $offset = vb0->Offset` and `ref PoolX[$slot]` near this
  error. Both already parsed and are kept in the test as regression cover.

### 5. Slot expressions and slot/pool ranges

- **Construct:** `ps-t[$i] = ResourceFoo`, `ps-t[0:2] = null`, `vs-cb[$first:$last] = null`,
  `ResourceFoo = copy ps-t[$i]`, `PoolFoo[$first:$last] = null`. These failed to parse, and the
  syntax error swallowed the rest of the section.
- **DLL source:** `DirectX11/CommandList.cpp`, `ResourceCopyTarget::ParseTargetSlotExpression`
  (slot types `o`, `vb`, `so`, `?s-t`, `ps-u`/`cs-u`, `?s-cb`, followed by `[expression]` or
  `[start:end]`; ranges only for `-t`, `-u`, `-cb`), `ResourceCopyTarget::ParseTargetPool`
  ("Pool range: PoolFoo[$a:$b], resources only") and `ResourceCopyTarget::ParseRangeBounds`.
  Added in XXMI-Libs-Package `34fa32f` (PR #55).
- **Fix:** `grammar.js`, new `slot_expression` (`slot_type` + `index_expression`) in
  `_resource_operand` and `_limited_resource_operand`; `_index_suffix` accepts a `start:end`
  range (fields `start`, `end`). Bounds take the same operands as a pool index (numbers,
  variables, runtime parameters); the DLL accepts any expression there. The grammar doesn't
  enforce which slot types take ranges.
- **Test:** `test/corpus/xxmi.txt`, "XXMI: slot expressions and slot/pool ranges".
