/**
 * Report pipeline example using mock ActivityWatch data (no HTTP, no API key).
 *
 * Run from repo root:
 *   deno run --allow-read examples/report-pipeline.ts
 *
 * Guides:
 *   docs/host-integration.md
 *   https://jsr.io/@sarkarshubhdeep/jerry-lib
 */
import {
  type Bucket,
  buildActivitySummary,
  formatActivityContext,
  initJerryLib,
  type RawEvent,
  resolveActivityRange,
} from '../mod.ts'

initJerryLib()

const mockBuckets: Bucket[] = [
  {
    id: 'aw-watcher-window_hostname',
    type: 'currentwindow',
    hostname: 'hostname',
  },
  {
    id: 'aw-watcher-afk_hostname',
    type: 'afkstatus',
    hostname: 'hostname',
  },
]

const mockEvents: Record<string, RawEvent[]> = {
  'aw-watcher-window_hostname': [
    {
      timestamp: '2026-06-14T10:00:00.000Z',
      duration: 3600,
      data: { app: 'Cursor', title: 'report-pipeline.ts — jerry-lib' },
    },
    {
      timestamp: '2026-06-14T11:30:00.000Z',
      duration: 1800,
      data: { app: 'Terminal', title: 'deno task test' },
    },
  ],
  'aw-watcher-afk_hostname': [
    {
      timestamp: '2026-06-14T12:00:00.000Z',
      duration: 300,
      data: { status: 'afk' },
    },
  ],
}

const pagesByBucket: Record<string, number> = {
  'aw-watcher-window_hostname': 1,
  'aw-watcher-afk_hostname': 1,
}

// Step 1: resolve time range from natural language
const range = resolveActivityRange('yesterday', undefined, mockBuckets)
console.log('Range:', range.label)
console.log('  ', range.start.toISOString(), '→', range.end.toISOString())

// Step 2: aggregate events (host would HTTP-fetch real data here)
const summary = buildActivitySummary(
  mockBuckets,
  mockEvents,
  pagesByBucket,
  range,
  { hostname: 'hostname' },
)

// Step 3: format for LLM context
const activityContext = formatActivityContext(summary)

console.log('\n--- Activity context (dry-run preview) ---\n')
console.log(activityContext)

console.log('\n--- Next step (requires OPENAI_API_KEY in host) ---')
console.log('await generateReport({ userPrompt: "yesterday", activityContext, config })')
