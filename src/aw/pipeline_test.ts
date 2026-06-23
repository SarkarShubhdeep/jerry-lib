import { assertStringIncludes } from 'jsr:@std/assert@^1.0.13'
import { buildActivitySummary } from './build-summary.ts'
import { formatActivityContext } from './format.ts'
import { resolveActivityRange } from './intent.ts'
import type { Bucket, RawEvent } from './types.ts'

const buckets: Bucket[] = [
  { id: 'aw-watcher-window_testhost', type: 'currentwindow', hostname: 'testhost' },
  { id: 'aw-watcher-web_testhost', type: 'web.tab.current', hostname: 'testhost' },
]

const windowEvents: RawEvent[] = [
  {
    timestamp: '2026-06-10T09:00:00.000Z',
    duration: 3600,
    data: { app: 'Cursor', title: 'jerry-lib' },
  },
  {
    timestamp: '2026-06-10T10:30:00.000Z',
    duration: 900,
    data: { app: 'Terminal', title: 'deno task test' },
  },
]

const webEvents: RawEvent[] = [
  {
    timestamp: '2026-06-10T09:30:00.000Z',
    duration: 600,
    data: {
      url: 'https://github.com/example/jerry-lib',
      title: 'example/jerry-lib',
    },
  },
]

const pagesByBucket: Record<string, number> = {
  'aw-watcher-window_testhost': 1,
  'aw-watcher-web_testhost': 1,
}

Deno.test('pipeline resolves range, builds summary, and formats activity context', () => {
  const range = resolveActivityRange('2026-06-10', undefined, buckets)

  const summary = buildActivitySummary(
    buckets,
    {
      'aw-watcher-window_testhost': windowEvents,
      'aw-watcher-web_testhost': webEvents,
    },
    pagesByBucket,
    range,
    { hostname: 'testhost' },
  )

  const context = formatActivityContext(summary)

  assertStringIncludes(context, '## ActivityWatch data (local, read-only)')
  assertStringIncludes(context, 'Cursor — jerry-lib')
  assertStringIncludes(context, 'Total events in range: 3')
  assertStringIncludes(context, '[example/jerry-lib](https://github.com/example/jerry-lib)')
})

Deno.test('pipeline produces empty-range message when events fall outside window', () => {
  const range = resolveActivityRange('2026-06-11', undefined, buckets)

  const summary = buildActivitySummary(
    buckets,
    {
      'aw-watcher-window_testhost': windowEvents,
      'aw-watcher-web_testhost': webEvents,
    },
    pagesByBucket,
    range,
    { hostname: 'testhost' },
  )

  const context = formatActivityContext(summary)

  assertStringIncludes(context, 'No ActivityWatch events were recorded in this time range.')
})
