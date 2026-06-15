# @sarkarshubhdeep/jerry-lib

Host-agnostic Jerry engine: a3t prompt loading, ActivityWatch formatting, and OpenAI calls (`ask`, `generateReport`, `recheckReport`).

No CLI, no stdout, no Cliffy. **jerry-cli** and **jerry-client (Electron)** are reference adapters — they fetch ActivityWatch, load config, and render output. The engine lives here.

**JSR:** [jsr.io/@sarkarshubhdeep/jerry-lib](https://jsr.io/@sarkarshubhdeep/jerry-lib)  
**Guides:** [docs/](https://github.com/SarkarShubhdeep/jerry-lib/tree/main/docs) · [API reference](https://jsr.io/@sarkarshubhdeep/jerry-lib/doc)

## Install

Published exclusively on [JSR](https://jsr.io).

### Deno

```bash
deno add jsr:@sarkarshubhdeep/jerry-lib@^0.1.2
```

```ts
import {
  ask,
  generateReport,
  initJerryLib,
  type JerryLlmConfig,
} from '@sarkarshubhdeep/jerry-lib'
```

### Node / Electron

```bash
npx jsr add @sarkarshubhdeep/jerry-lib@^0.1.2
```

Import the same package name: `@sarkarshubhdeep/jerry-lib`.

## Quick start

Integration steps (same on JSR and GitHub):

1. Install from JSR
2. `initJerryLib({ assets: { overridePath } })` once per process
3. Host loads `JerryLlmConfig` (library never reads env)
4. Host fetches ActivityWatch over HTTP
5. `resolveActivityRange` → `buildActivitySummary` → `formatActivityContext`
6. `generateReport` / `ask` with progress callbacks

See [docs/host-integration.md](https://github.com/SarkarShubhdeep/jerry-lib/blob/main/docs/host-integration.md) for the full walkthrough and [docs/agents-and-ides.md](https://github.com/SarkarShubhdeep/jerry-lib/blob/main/docs/agents-and-ides.md) for ML agent checklists.

## `initJerryLib({ assets })`

Call once per process before `ask` or `generateReport`. Prompts auto-initialize with shipped defaults on first use if you skip this.

| Option                | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `assets.overridePath` | User-local directory for prompt overrides (resolved before shipped defaults) |
| `assets.shippedRoot`  | Optional root for bundled prompts; defaults to package `assets/`              |

```ts
import { join } from 'node:path'
import { homedir } from 'node:os'
import { initJerryLib } from '@sarkarshubhdeep/jerry-lib'

// CLI host
initJerryLib({
  assets: { overridePath: join(homedir(), '.config/jerry/assets') },
})

// Electron: join(app.getPath('userData'), 'assets')
// Server: initJerryLib() — shipped defaults only
```

Prompt overrides: [docs/a3t-prompts.md](https://github.com/SarkarShubhdeep/jerry-lib/blob/main/docs/a3t-prompts.md).

## Usage

The host supplies `JerryLlmConfig` (API key and model). The library never reads environment variables.

```ts
import {
  ask,
  buildActivitySummary,
  formatActivityContext,
  generateReport,
  resolveActivityRange,
  type JerryLlmConfig,
} from '@sarkarshubhdeep/jerry-lib'

const config: JerryLlmConfig = {
  apiKey: process.env.OPENAI_API_KEY ?? '',
  model: 'gpt-4o-mini',
}

// Ask (no ActivityWatch)
const answer = await ask('What is Deno?', config, (update) => {
  console.log(update.phase) // host maps phase → UI label
})

// Report — host fetches AW buckets/events via HTTP first
const range = resolveActivityRange('yesterday', undefined, buckets)
const summary = buildActivitySummary(
  buckets,
  eventsByBucket,
  pagesByBucket,
  range,
)
const activityContext = formatActivityContext(summary)

const result = await generateReport(
  { userPrompt: 'Summarize my work yesterday', activityContext, config },
  (phase) => console.log(phase), // 'writing' | 'rechecking'
)
```

Runnable mock example: [examples/report-pipeline.ts](./examples/report-pipeline.ts).

## Progress phases

Hosts own all user-facing labels. See [JSR Docs](https://jsr.io/@sarkarshubhdeep/jerry-lib/doc/~/ReportPhase) for `ReportPhase` and `LlmStatusPhase` types.

## API reference

Full symbol documentation: [jsr.io/@sarkarshubhdeep/jerry-lib/doc](https://jsr.io/@sarkarshubhdeep/jerry-lib/doc)

## Versioning

Semver on the public `mod.ts` API. See [CHANGELOG.md](./CHANGELOG.md).

- `0.x` — API stabilizing
- **Patch** — bug fixes, prompt text tweaks, documentation
- **Minor** — new backward-compatible exports
- **Major** — breaking API changes

## Development

```bash
deno task test
deno task check
deno task check:docs
deno task lint
deno task fmt
```

## Dependencies

- [openai](https://www.npmjs.com/package/openai) — LLM client (npm)
- [a3t](https://github.com/mieweb/a3t) — layered prompt asset loader (vendored in `vendor/a3t/`)
