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

### 6. `run` accepts the original-texture snapshot and restore commands

- **Construct:** `run = SnapshotOriginalTextures`, `post run = RestoreOriginalTextures`.
- **DLL source:** `DirectX11/CommandList.cpp`, `ParseCommandListGeneralCommands` compares the value
  with `snapshotoriginaltextures` / `restoreoriginaltextures` after the `run` branch falls through.
- **Fix:** `grammar.js`, `run_instruction` accepts `snapshotoriginaltextures` or `restoreoriginaltextures`,
  case-insensitive (`run_instruction_key_value`).
- **Note:** the DLL ignores the key, and a line without `=` has an empty value, so a bare
  `snapshotoriginaltextures` line does not match there. Only the `run` key is modeled.
- **Test:** `test/corpus/xxmi.txt`, "XXMI: run with snapshot and restore of original textures".

### 7. `ps->MatchTextures(Resource) = source`

- **DLL source:** `DirectX11/CommandList.cpp`, `ParseCommandListResourceCopyTargetDirective` and
  `parse_texture_override_operation` (pixel shaders only, custom resource candidate; both checked
  by the linter, not the grammar).
- **Fix:** `grammar.js`, `assignment_statement` accepts `shader_identifier -> property(arguments)`
  on the left, with a `resource_usage_expression` on the right. The property is restricted to
  `MatchTextures`; the shader stage stays open for the linter.
- **Test:** `test/corpus/xxmi.txt`, "XXMI: MatchTextures destination takes a resource".

### 8. Hash literals as member arguments

- **DLL source:** `DirectX11/CommandList.cpp`, `ParseHashToken` and `CommandArgumentReader::GetHash`
  (1 to 16 hex digits, with or without `0x`); `SyntaxTarget::ParseMemberArguments` (`MemberArg::Type::Hash`).
- **Fix:** `grammar.js`, `arguments` accepts `0x` hex literals (`hex_integer`). Un-prefixed hex is deliberately not
  modelled: it cannot be told apart from an identifier. Resource arguments
  (`->HammingDistance(ResourceB)`) and `->GetMatchFormat` already parsed.
- **Test:** `test/corpus/xxmi.txt`, "XXMI: hash literal and resource arguments of resource members".

### 9. Corpus cover only

Tests for `[Preset...]` sections, `unless_null`, shader target getters (`ps->cb_first_slot`, …)
and the expression functions in `function_tokens`; no grammar change was needed.

### 10. `run` takes the 1.3.2 initial-texture names

- **DLL source:** XXMI-Libs-Package v1.3.2 (`e2bca90e`), `DirectX11/CommandList.cpp:1339` and `:1342`
  (`snapshotinitialtextures`, `restoreinitialtextures`; v1.3.1 had `...originaltextures`).
- **Fix:** `grammar.js`, `run_instruction_key_value` matches `(?:snapshot|restore)(?:original|initial)textures`.
  The old names stay so per-version 1.3.1 specs still parse; the spec decides which one is valid.
- **Test:** `test/corpus/xxmi-1.3.2.txt`, "XXMI 1.3.2: run takes the initial-textures names and still the
  original ones".

### 11. `[Filter...]` sections and filter references

- **DLL source (v1.3.2, `e2bca90e`):** `DirectX11/IniHandler.cpp:67` (`{L"Filter", true}` section prefix),
  `:2210` `ParseFilterSection` (`match_format`, `match_dhash`, `match_confidence`) and `:2246`
  `ParseFilterSections`; `:2286` `ParseCommandListResourceFilterTargetDirective` is tried for every command
  list line. `DirectX11/CommandList.cpp:6486` `ResourceFilterTarget::ParseTargetPrefix` (`@FilterFoo`),
  `:6498` `ParseTargetMember` (`->format`, `->confidence`), `:6515` `ParseTarget` (name must start with
  `filter` and have at least one more character; `null` as a source), `:6632` `parse_filter_target_copy_source`
  and `:6718` `ParseCommandListResourceFilterTargetDirective` (`FilterFoo = null`, `= ref FilterBar`),
  `:5239` `parse_resource_filter` (a filter as an expression operand), `:8508` and `:8714`
  (`MemberArg::Type::Filter` for `->HammingDistance(FilterFoo)`).
- **Fix:** `src/scanner.c` gets a `FILTER_HEADER_PREFIX` token (`Filter`) next to the `Resource`/`Pool`
  prefixes; the suffix after it reuses `SUFFIXED_RESOURCE_HEADER`. The scanner refuses `filter_index`
  (the TextureOverride/ShaderOverride key, `IniHandler.cpp:2632`) so that key stays a setting statement.
  `grammar.js`: `setting_section_header` accepts the prefix, and a new `filter` node
  (`filter_prefix` + `section_identifier`) joins `_resource_operand` and `_limited_resource_operand`, which
  covers filter assignments, `@FilterFoo`, `FilterFoo->format` and filter arguments. The keys of a
  `[Filter...]` section are ordinary setting statements.
- **Removed constructs:** `match_format`/`match_dhash`/`match_confidence` in `[Resource]` (removed at
  `IniHandler.cpp`) are plain setting keys and `->getmatchformat` a plain `resource_property`, so there
  were no dedicated rules to drop; the `->MatchTextures(...)` rules (change 7) stay for 1.3.1 specs.
- **Test:** `test/corpus/xxmi-1.3.2.txt`, "Filter sections", "filter assignment, comparison and members" and
  "filter_index stays a setting key".

### 12. `ps-t[FilterFoo]` slot filtering

- **DLL source (v1.3.2, `e2bca90e`):** `DirectX11/CommandList.cpp:8928` `ResourceCopyTarget::ParseTargetSlotExpression`
  tries the bracket contents as a filter (`:8977`, `SLOT_FILTER`) before an expression or range;
  `:9832` `parse_slot_filter_operation` warns that only `ps-t` slots work, which the linter checks, not the
  grammar.
- **Fix:** `grammar.js`, the `index_expression` of a `slot_expression` may be a `filter`. `src/scanner.c`,
  `]` ends a custom resource identifier (section names cannot contain it), otherwise `FilterFoo]` was read
  as one name.
- **Test:** `test/corpus/xxmi-1.3.2.txt`, "XXMI 1.3.2: slot filter in a ps-t slot".

### 13. Hex and binary numeric literals

- **Construct:** `local $x = FRAME_NUMBER & 0xFF` and `global locked $s = 0b111` (EFMI `SpatialIdentification.ini`).
- **DLL source (`8bd31f7`):** `DirectX11/CommandList.cpp:4353` `ParseFloatToken`: `0b` (lowercase only) followed
  by 1 to 64 binary digits (`IniHandler.cpp:1035` `ParseBinaryLiterals`, which rejects a 65th digit), otherwise
  `wcstof`, which takes `0x`/`0X` integers and hex floats (`0x1.8p3`). The expression tokenizer starts a
  literal at a digit or `.` (`CommandList.cpp:5096`) and a sign is a unary operator. `[Constants]` values go
  through `wcstof` and then the expression parser (`IniHandler.cpp:1179` `ParseFloatValue`). Anything
  `wcstof` stops at becomes the next token, so `0xG`, `0b2` and `0B11` leave a stray word.
- **Fix:** `grammar.js`, two more alternatives of `numeric_constant`, so no new node.
- **Test:** `test/corpus/xxmi.txt`, the "hex and binary literals" and "malformed" cases.

### 14. Expressions in pool indexes and range bounds

- **Construct:** `ref PoolLods[$a * $b + $lod]`, `$PoolDebug[$base + 0] = $hash` (EFMI `MergedSkeleton.ini`).
- **DLL source (`8bd31f7`):** `CommandList.cpp:4268` `FindResourceCopyTargetTokenEnd` accepts any characters in
  balanced brackets; `:8771` `ParseTargetPool` parses the index text with `CommandListExpression` unless it is a
  plain number, and `:8755` `ParseRangeBounds` does the same for each bound; `:10000`
  `parse_pool_variable_operation` handles pool variable assignments.
- **Fix:** `grammar.js`, `_index_term` adds binary, unary, parenthesized and function expressions to the
  single-term bound; a lone term keeps its bare node. `slot_expression` is unchanged.
- **Test:** `test/corpus/xxmi.txt`, "pool index and range bounds are expressions" and "unterminated pool index".
