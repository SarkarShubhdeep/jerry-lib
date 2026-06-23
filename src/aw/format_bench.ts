import { formatActivityContext } from './format.ts'
import type { AwActivitySummary } from './types.ts'

function largeSummary(): AwActivitySummary {
  return {
    connected: true,
    bucketCount: 4,
    rangeHours: 8,
    rangeLabel: 'Today (since local midnight)',
    range: {
      start: '2026-06-10T04:00:00.000Z',
      end: '2026-06-10T12:00:00.000Z',
    },
    afk: { status: 'not-afk', timestamp: '2026-06-10T11:55:00.000Z' },
    latest: Array.from({ length: 20 }, (_, i) => ({
      watcher: 'window' as const,
      bucketId: 'aw-watcher-window_hostname',
      app: 'Cursor',
      title: `file-${i}.ts`,
      timestamp: '2026-06-10T11:55:00.000Z',
    })),
    topActivities: Array.from({ length: 20 }, (_, i) => ({
      watcher: 'window' as const,
      app: 'Cursor',
      title: `file-${i}.ts`,
      durationSeconds: 3600 - i * 10,
      eventCount: 10 + i,
    })),
    topWebLinks: Array.from({ length: 25 }, (_, i) => ({
      url: `https://github.com/example/repo-${i}`,
      title: `repo-${i}`,
      durationSeconds: 900 - i * 5,
      eventCount: 5,
    })),
    meetingSessions: [],
    eventCounts: { window: 10_000, web: 5_000 },
    eventFetchPages: { window: 10, web: 5 },
    totalEventCount: 15_000,
    totalApiCalls: 15,
  }
}

const summary = largeSummary()

Deno.bench('formatActivityContext — large summary', () => {
  formatActivityContext(summary)
})
