import { buildActivitySummary } from './build-summary.ts'
import type { ActivityTimeRange } from './intent.ts'
import type { Bucket, RawEvent } from './types.ts'

const range: ActivityTimeRange = {
  start: new Date('2026-06-10T00:00:00.000Z'),
  end: new Date('2026-06-11T00:00:00.000Z'),
  label: 'Bench window',
}

const buckets: Bucket[] = [
  { id: 'aw-watcher-window_benchhost', type: 'currentwindow', hostname: 'benchhost' },
  { id: 'aw-watcher-web_benchhost', type: 'web.tab.current', hostname: 'benchhost' },
]

const windowEvents: RawEvent[] = Array.from({ length: 10_000 }, (_, i) => ({
  timestamp: new Date(Date.UTC(2026, 5, 10, 8, 0, i % 60)).toISOString(),
  duration: 30,
  data: { app: 'Cursor', title: `file-${i % 100}.ts` },
}))

const webEvents: RawEvent[] = Array.from({ length: 5_000 }, (_, i) => ({
  timestamp: new Date(Date.UTC(2026, 5, 10, 9, 0, i % 60)).toISOString(),
  duration: 20,
  data: {
    url: `https://github.com/example/repo-${i % 50}`,
    title: `repo-${i % 50}`,
  },
}))

const eventsByBucket = {
  'aw-watcher-window_benchhost': windowEvents,
  'aw-watcher-web_benchhost': webEvents,
}

const pagesByBucket = {
  'aw-watcher-window_benchhost': 10,
  'aw-watcher-web_benchhost': 5,
}

Deno.bench('buildActivitySummary — 15k events across window and web', () => {
  buildActivitySummary(buckets, eventsByBucket, pagesByBucket, range, {
    hostname: 'benchhost',
  })
})
