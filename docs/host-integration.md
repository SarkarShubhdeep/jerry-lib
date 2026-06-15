# Host integration guide

How to integrate [@sarkarshubhdeep/jerry-lib](https://jsr.io/@sarkarshubhdeep/jerry-lib) into **any** application — CLI, Electron, web backend, Deno script, or cron job.

**jerry-cli** and **jerry-client (Electron)** are reference adapters. They demonstrate the pattern; the engine is jerry-lib.

## Responsibilities split

| Layer | Host (your app) | jerry-lib |
|-------|-----------------|-----------|
| Install | `deno add` or `npx jsr add` | Published on JSR |
| Config | Load API key, model, paths from env/files | Accepts `JerryLlmConfig`; never reads env |
| ActivityWatch | HTTP fetch to `localhost:5600` (or custom base URL) | Pure functions on raw bucket/event data |
| Prompts | Pass `overridePath` via `initJerryLib` | a3t layered loading + shipped defaults |
| UI / I/O | Terminal, IPC, HTTP response, files | Returns strings and typed objects only |
| Progress labels | Map `ReportPhase` / `LlmStatusPhase` to user copy | Emits phase codes only |

## Step 1 — Install

### Deno

```bash
deno add jsr:@sarkarshubhdeep/jerry-lib@^0.1.2
```

### Node / Electron

```bash
npx jsr add @sarkarshubhdeep/jerry-lib@^0.1.2
```

## Step 2 — Initialize once per process

Call `initJerryLib` before `ask` or `generateReport`. Choose an override path suited to your host:

```ts
import { initJerryLib } from '@sarkarshubhdeep/jerry-lib'
import { join } from 'node:path'
import { homedir } from 'node:os'

// CLI host — user config directory
initJerryLib({
  assets: { overridePath: join(homedir(), '.config/jerry/assets') },
})

// Electron host — app userData
// import { app } from 'electron'
// initJerryLib({
//   assets: { overridePath: join(app.getPath('userData'), 'assets') },
// })

// Headless server — shipped defaults only
// initJerryLib()
```

See [a3t-prompts.md](./a3t-prompts.md) for override workflow and template variables.

## Step 3 — Load LLM config

The host supplies credentials. jerry-lib does not read `process.env` or `.env` files.

```ts
import type { JerryLlmConfig } from '@sarkarshubhdeep/jerry-lib'

const config: JerryLlmConfig = {
  apiKey: process.env.OPENAI_API_KEY ?? '',
  model: 'gpt-4o-mini',
}
```

## Step 4 — Fetch ActivityWatch (host HTTP)

jerry-lib has **no HTTP client** for ActivityWatch. Your host fetches buckets and events, then passes raw data to library functions.

Typical ActivityWatch REST API (`http://localhost:5600/api/0`):

| Endpoint | Purpose |
|----------|---------|
| `GET /buckets/` | List all buckets |
| `GET /buckets/{id}/events?start=…&end=…&limit=1000` | Paginated events per bucket |

Reference implementation: [jerry-cli `src/aw/client.ts`](https://github.com/SarkarShubhdeep/jerry-client/blob/main/jerry-cli/src/aw/client.ts).

```ts
const AW_BASE = 'http://localhost:5600/api/0'

async function listBuckets() {
  const res = await fetch(`${AW_BASE}/buckets/`)
  const body = await res.json() as Record<string, { type: string; hostname?: string }>
  return Object.entries(body).map(([id, b]) => ({ id, ...b }))
}

async function fetchEvents(bucketId: string, start: Date, end: Date) {
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
    limit: '1000',
  })
  const res = await fetch(`${AW_BASE}/buckets/${bucketId}/events?${params}`)
  return await res.json()
}
```

## Step 5 — Resolve time range

Parse natural-language prompts into a time window:

```ts
import { resolveActivityRange } from '@sarkarshubhdeep/jerry-lib'

const buckets = await listBuckets()
const range = resolveActivityRange('yesterday', undefined, buckets)
// range: { start, end, label }
```

Supported keywords include `today`, `yesterday`, `last N hours`, calendar ranges (`"May 13 to May 20"`), and full-history phrases when bucket metadata allows.

## Step 6 — Build and format activity context

```ts
import {
  buildActivitySummary,
  formatActivityContext,
  pickBucket,
} from '@sarkarshubhdeep/jerry-lib'
import { hostname } from 'node:os'

// Fetch events for each watcher bucket (window, web, vscode, afk)
const eventsByBucket: Record<string, RawEvent[]> = {}
const pagesByBucket: Record<string, number> = {}
// ... populate via your HTTP fetches ...

const summary = buildActivitySummary(
  buckets,
  eventsByBucket,
  pagesByBucket,
  range,
  { hostname: hostname() },
)

const activityContext = formatActivityContext(summary)
```

`formatActivityContext` returns a markdown block suitable as LLM context (meetings, top apps, work-related links, latest snapshots).

## Step 7 — Generate report or ask

### Report (with ActivityWatch)

```ts
import { generateReport } from '@sarkarshubhdeep/jerry-lib'

const result = await generateReport(
  {
    userPrompt: 'Summarize my work yesterday',
    activityContext,
    config,
  },
  (phase) => {
    // phase: 'writing' | 'rechecking'
    // Map to your UI — the library does not emit user-facing strings
    console.log(phase)
  },
)

console.log(result.message.content)
```

`generateReport` runs a two-phase pipeline: draft narrative, then recheck pass. Use `recheckReport` directly if you need finer control.

### Ask (no ActivityWatch)

```ts
import { ask } from '@sarkarshubhdeep/jerry-lib'

const answer = await ask('What is ActivityWatch?', config, (update) => {
  // update.phase: 'thinking' | 'web_search_searching' | ...
  console.log(update.phase)
})
```

## Progress phases

Hosts own all user-facing labels.

| `ReportPhase` | Typical label |
|---------------|---------------|
| `writing` | Writing work narrative… |
| `rechecking` | Rechecking the work narrative… |

| `LlmStatusPhase` | Typical label |
|------------------|---------------|
| `thinking` | Thinking… |
| `web_search_searching` | Searching web… |
| `web_search_done` | Searched web |
| `finalizing` | Finalizing answer… |
| `done` | Done |

## Host-specific override paths

| Host type | Suggested `overridePath` |
|-----------|--------------------------|
| CLI | `~/.config/jerry/assets` |
| Electron | `{userData}/assets` |
| Web backend | Shipped defaults only, or env-based path |
| CI / cron | Shipped defaults only |

## Dry-run pattern

Before calling the LLM, validate AW connectivity and preview formatted context:

1. Fetch buckets and events
2. `buildActivitySummary` + `formatActivityContext`
3. Print context to stdout or return in API response

See [examples/report-pipeline.ts](../examples/report-pipeline.ts) for a runnable mock-data example.

## Reference adapters

Study these thin wrappers — they contain **no** Jerry engine logic:

| Adapter | `initJerryLib` | AW HTTP | Output |
|---------|----------------|---------|--------|
| [jerry-cli](https://github.com/SarkarShubhdeep/jerry-client/tree/main/jerry-cli) | `~/.config/jerry/assets` | `src/aw/client.ts` | Terminal + `.md` files |
| jerry-client Electron | `userData/assets` (planned, #33) | `electron/aw/client.ts` | Chat UI + IPC |

## Next steps

- [a3t-prompts.md](./a3t-prompts.md) — customize system prompts without rebuilding
- [agents-and-ides.md](./agents-and-ides.md) — ML agent integration checklist
- [JSR API reference](https://jsr.io/@sarkarshubhdeep/jerry-lib/doc)
