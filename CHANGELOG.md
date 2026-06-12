# Changelog

All notable changes to `@sarkarshubhdeep/jerry-lib` are documented here. Versioning follows [semver](https://semver.org/) on the public `mod.ts` API.

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
