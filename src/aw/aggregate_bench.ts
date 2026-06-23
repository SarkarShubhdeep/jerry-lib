import { aggregateTopActivities, aggregateTopWebLinks } from './aggregate.ts'
import type { RawEvent } from './types.ts'

function makeWindowEvents(count: number): RawEvent[] {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.UTC(2026, 5, 10, 8, 0, i % 60)).toISOString(),
    duration: 30 + (i % 10),
    data: { app: 'Cursor', title: `file-${i % 50}.ts` },
  }))
}

function makeWebEvents(count: number): RawEvent[] {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.UTC(2026, 5, 10, 9, 0, i % 60)).toISOString(),
    duration: 20 + (i % 5),
    data: {
      url: `https://github.com/example/repo-${i % 25}`,
      title: `repo-${i % 25}`,
    },
  }))
}

const windowEvents10k = makeWindowEvents(10_000)
const windowEvents100k = makeWindowEvents(100_000)
const webEvents10k = makeWebEvents(10_000)

Deno.bench('aggregateTopActivities — 10k events', () => {
  aggregateTopActivities(windowEvents10k, 'window')
})

Deno.bench('aggregateTopActivities — 100k events', () => {
  aggregateTopActivities(windowEvents100k, 'window')
})

Deno.bench('aggregateTopWebLinks — 10k events', () => {
  aggregateTopWebLinks(webEvents10k)
})
