# Changelog

All notable changes to `@sarkarshubhdeep/jerry-lib` are documented here. Versioning follows [semver](https://semver.org/) on the public `mod.ts` API.

## 0.1.4 — 2026-06-23

### Added

- Full unit test suite: `mod_test.ts` plus per-module tests for `aw/aggregate`, `aw/dates`,
  `aw/event-range`, `aw/format`, `aw/pipeline`, `aw/time-format`, `llm/internal`, `llm/models`
- Benchmark suite: `aw/aggregate_bench`, `aw/build-summary_bench`, `aw/format_bench`
- `deno task test:coverage` — runs tests with coverage and prints report
- `deno task bench` — runs all benchmarks

### Changed

- CI: adds coverage report, benchmark run, version-bump guard, and CHANGELOG-entry guard on
  pushes to `main`
- `deno.json` publish exclude now also drops `**/*_bench.ts` and root-level `mod_test.ts`

## 0.1.3 — 2026-06-15

### Added

- JSDoc on all public exported symbols for JSR Docs tab and score (≥80% symbol documentation)

## 0.1.2 — 2026-06-15

### Added

- GitHub guides: `docs/host-integration.md`, `docs/a3t-prompts.md`, `docs/agents-and-ides.md`
- `examples/report-pipeline.ts` — mock AW data dry-run pipeline
- `deno task check:docs` — verify README links and doc files stay in sync
- JSDoc on public API exports for [JSR Docs tab](https://jsr.io/@sarkarshubhdeep/jerry-lib/doc)

### Changed

- README restructured: quick start + links to deep guides (API tables moved to JSR Docs)

## 0.1.1 — 2026-06-15

### Fixed

- Lazy-resolve shipped assets root so Deno JSR consumers (`jsr:` / `https:` `import.meta.url`) can load bundled prompts without `fileURLToPath` crashing at module load ([#1](https://github.com/SarkarShubhdeep/jerry-lib/issues/1))

## 0.1.0 — 2026-06-10

Initial release extracted from [jerry-client](https://github.com/SarkarShubhdeep/jerry-client).

### Added

- Host-agnostic Jerry engine: a3t prompt loading, ActivityWatch formatting, OpenAI (`ask`, `generateReport`, `recheckReport`)
- `initJerryLib({ assets })` for layered prompt overrides
- Shipped defaults under `assets/prompts/` (`ask.txt`, `report.txt`, `recheck.txt`)
- Cross-runtime asset loading via `node:fs/promises` (Deno + Node/Electron via JSR)

### Versioning policy (0.x)

- **Patch** — bug fixes, prompt text tweaks
- **Minor** — new backward-compatible exports in `mod.ts`
- **Major** — removed or renamed exports, breaking type changes
