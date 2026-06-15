# jerry-lib documentation

Canonical guides for integrating [@sarkarshubhdeep/jerry-lib](https://jsr.io/@sarkarshubhdeep/jerry-lib) into any host application.

| Guide | Audience |
|-------|----------|
| [host-integration.md](./host-integration.md) | Developers building CLI, Electron, server, or script hosts |
| [a3t-prompts.md](./a3t-prompts.md) | Contributors customizing LLM system prompts |
| [agents-and-ides.md](./agents-and-ides.md) | ML/coding agents (Cursor, Copilot, etc.) scaffolding integrations |

## JSR vs GitHub

| Surface | What it covers |
|---------|----------------|
| [JSR Overview](https://jsr.io/@sarkarshubhdeep/jerry-lib) | Install, quick start, `initJerryLib` — from repo [`README.md`](../README.md) |
| [JSR Docs tab](https://jsr.io/@sarkarshubhdeep/jerry-lib/doc) | API reference generated from JSDoc on `mod.ts` and exports |
| **This `docs/` folder** | Deep integration guides, agent workflows, prompt overrides |

Both surfaces describe the **same integration steps** in the same order:

1. Install from JSR (`deno add` / `npx jsr add`)
2. `initJerryLib({ assets: { overridePath } })` once per process
3. Host loads `JerryLlmConfig` (the library never reads environment variables)
4. Host fetches ActivityWatch buckets/events over HTTP
5. `resolveActivityRange` → `buildActivitySummary` → `formatActivityContext`
6. `generateReport` / `ask` with progress callbacks
7. Optional: override prompts under `assets/prompts/`

## Sync checklist

When changing how jerry-lib is used, update **all** affected surfaces:

- [ ] [`README.md`](../README.md) — install snippets and quick-start examples
- [ ] JSDoc on touched exports in `mod.ts` / `src/`
- [ ] Relevant file(s) in this `docs/` folder
- [ ] Run `deno task check:docs` before opening a PR

## Reference adapters

jerry-cli and jerry-client (Electron) are **reference adapters**, not the engine. They fetch ActivityWatch over HTTP, load config, and render output; all Jerry logic lives in jerry-lib.

- CLI entry: [jerry-cli `src/cli.ts`](https://github.com/SarkarShubhdeep/jerry-client/blob/main/jerry-cli/src/cli.ts)
- Report command: [jerry-cli `src/commands/report.ts`](https://github.com/SarkarShubhdeep/jerry-client/blob/main/jerry-cli/src/commands/report.ts)
