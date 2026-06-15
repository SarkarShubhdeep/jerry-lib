# Agents and IDE integration

Guide for ML/coding agents (Cursor, GitHub Copilot, Windsurf, etc.) integrating [@sarkarshubhdeep/jerry-lib](https://jsr.io/@sarkarshubhdeep/jerry-lib) into a host application.

**Goal:** Fetch ActivityWatch data, format it, and generate work reports (or run `ask`) using jerry-lib — without reading jerry-cli or Electron source.

## When to use jerry-lib vs jerry-cli

| Approach | Use when |
|----------|----------|
| **jerry-lib** (JSR package) | Building a new app, API, Electron feature, or automation with custom UI |
| **jerry-cli** | Quick terminal reports; testing prompt overrides only |

jerry-cli is a reference adapter. Import jerry-lib directly for any non-CLI host.

## Integration checklist

Copy this checklist into your agent session or `AGENTS.md`:

```
[ ] Add @sarkarshubhdeep/jerry-lib from JSR (deno add or npx jsr add)
[ ] Call initJerryLib({ assets: { overridePath } }) once at process startup
[ ] Host loads JerryLlmConfig (apiKey, model) — jerry-lib never reads env
[ ] Host fetches AW: GET http://localhost:5600/api/0/buckets/
[ ] Host fetches events per bucket for the resolved time range
[ ] resolveActivityRange(userPrompt, hoursFlag?, buckets)
[ ] buildActivitySummary(buckets, eventsByBucket, pagesByBucket, range, { hostname })
[ ] formatActivityContext(summary) → activityContext string
[ ] generateReport({ userPrompt, activityContext, config }, onProgress)
[ ] Map ReportPhase / LlmStatusPhase to UI labels (library emits codes only)
```

## Install snippet

### Deno project

```bash
deno add jsr:@sarkarshubhdeep/jerry-lib@^0.1.2
```

```ts
import {
  initJerryLib,
  resolveActivityRange,
  buildActivitySummary,
  formatActivityContext,
  generateReport,
  type JerryLlmConfig,
} from '@sarkarshubhdeep/jerry-lib'
```

### Node / Electron project

```bash
npx jsr add @sarkarshubhdeep/jerry-lib@^0.1.2
```

Same import path: `@sarkarshubhdeep/jerry-lib`.

## Minimal host scaffold

Agents should generate code following this structure:

```ts
import { join } from 'node:path'
import { homedir } from 'node:os'
import {
  initJerryLib,
  resolveActivityRange,
  buildActivitySummary,
  formatActivityContext,
  generateReport,
  type JerryLlmConfig,
  type Bucket,
  type RawEvent,
} from '@sarkarshubhdeep/jerry-lib'

const AW_BASE = process.env.ACTIVITYWATCH_BASE_URL ?? 'http://localhost:5600/api/0'

initJerryLib({
  assets: { overridePath: join(homedir(), '.config/myapp/assets') },
})

async function listBuckets(): Promise<Bucket[]> {
  const res = await fetch(`${AW_BASE}/buckets/`)
  const body = await res.json() as Record<string, Bucket>
  return Object.entries(body).map(([id, b]) => ({ id, ...b }))
}

async function fetchAllEvents(
  bucketId: string,
  start: Date,
  end: Date,
): Promise<RawEvent[]> {
  const events: RawEvent[] = []
  let page = 0
  while (page < 50) {
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
      limit: '1000',
    })
    const res = await fetch(`${AW_BASE}/buckets/${bucketId}/events?${params}`)
    const batch = await res.json() as RawEvent[]
    if (batch.length === 0) break
    events.push(...batch)
    if (batch.length < 1000) break
    page++
  }
  return events
}

export async function runReport(userPrompt: string, config: JerryLlmConfig) {
  const buckets = await listBuckets()
  const range = resolveActivityRange(userPrompt, undefined, buckets)

  const eventsByBucket: Record<string, RawEvent[]> = {}
  const pagesByBucket: Record<string, number> = {}
  for (const bucket of buckets) {
    const events = await fetchAllEvents(bucket.id, range.start, range.end)
    eventsByBucket[bucket.id] = events
    pagesByBucket[bucket.id] = Math.ceil(events.length / 1000)
  }

  const summary = buildActivitySummary(buckets, eventsByBucket, pagesByBucket, range)
  const activityContext = formatActivityContext(summary)

  return await generateReport(
    { userPrompt, activityContext, config },
    (phase) => console.log('[report]', phase),
  )
}
```

Full walkthrough: [host-integration.md](./host-integration.md). Runnable mock example: [examples/report-pipeline.ts](../examples/report-pipeline.ts).

## AGENTS.md template

Add to your project root so IDE agents load Jerry conventions:

```markdown
## Jerry / ActivityWatch integration

This project uses @sarkarshubhdeep/jerry-lib (JSR) for ActivityWatch formatting and LLM reports.

Rules:
- Import from `@sarkarshubhdeep/jerry-lib` — do not duplicate Jerry engine logic in this repo
- Call initJerryLib() once at startup with assets.overridePath for prompt overrides
- Host fetches ActivityWatch HTTP (localhost:5600); jerry-lib only accepts raw bucket/event data
- Pass JerryLlmConfig explicitly; jerry-lib does not read environment variables
- Use resolveActivityRange → buildActivitySummary → formatActivityContext → generateReport

Canonical docs:
- https://github.com/SarkarShubhdeep/jerry-lib/tree/main/docs
- https://jsr.io/@sarkarshubhdeep/jerry-lib
```

## Cursor rules snippet

For `.cursor/rules/jerry-lib.mdc`:

```markdown
---
description: Integrate jerry-lib for ActivityWatch reports
globs: **/*.{ts,tsx,js,mjs}
---

When adding ActivityWatch or work-report features:
1. Use @sarkarshubhdeep/jerry-lib from JSR — never reimplement aggregation or prompts
2. HTTP to ActivityWatch stays in the host (electron main, CLI, or server)
3. Follow docs/host-integration.md in SarkarShubhdeep/jerry-lib
4. Prompt overrides go in the host's assets.overridePath, not inline strings
```

## ActivityWatch via MCP (optional)

If the IDE has an ActivityWatch MCP server (e.g. [aw-mcp](https://github.com/SarkarShubhdeep/aw-mcp)), agents can fetch bucket/event data through MCP tools instead of raw `fetch`. The data shape must still match jerry-lib types (`Bucket`, `RawEvent`) before calling `buildActivitySummary`.

MCP is a **data source**; jerry-lib remains the **formatting and LLM engine**.

## Prompt tuning for agents

Agents customizing report quality should:

1. Copy shipped `report.txt` to the host override directory ([a3t-prompts.md](./a3t-prompts.md))
2. Edit template variables and instructions — keep `{{modelId}}` and `{{activityContext}}`
3. Test with jerry-cli (`deno task jerry report yesterday`) or the host's dry-run path
4. Open a PR in jerry-lib if promoting changes to shipped defaults

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Calling `generateReport` without `formatActivityContext` | Always pass pre-formatted `activityContext` |
| Expecting jerry-lib to fetch AW | Host must HTTP-fetch; lib is pure |
| Reading `OPENAI_API_KEY` inside lib calls | Build `JerryLlmConfig` in the host |
| Hardcoding system prompts | Use a3t overrides via `initJerryLib` |
| Skipping `initJerryLib` | Call once per process; auto-init works but override path won't apply |

## Reference implementations

| Repo | Role |
|------|------|
| [jerry-lib](https://github.com/SarkarShubhdeep/jerry-lib) | Engine (this package) |
| [jerry-cli `src/commands/report.ts`](https://github.com/SarkarShubhdeep/jerry-client/blob/main/jerry-cli/src/commands/report.ts) | Thin CLI adapter |
| [jerry-client `electron/aw/`](https://github.com/SarkarShubhdeep/jerry-client/tree/main/electron/aw) | Electron AW HTTP (consumer migration in progress) |
