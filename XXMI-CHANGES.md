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
