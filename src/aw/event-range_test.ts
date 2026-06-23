import { assertEquals } from 'jsr:@std/assert@^1.0.13'
import { filterEventsInRange } from './event-range.ts'
import type { RawEvent } from './types.ts'

const START = '2026-06-10T08:00:00.000Z'
const END = '2026-06-10T10:00:00.000Z'

const events: RawEvent[] = [
  { timestamp: '2026-06-10T07:59:59.999Z', duration: 60, data: { app: 'Before' } },
  { timestamp: '2026-06-10T08:00:00.000Z', duration: 60, data: { app: 'AtStart' } },
  { timestamp: '2026-06-10T09:30:00.000Z', duration: 60, data: { app: 'Inside' } },
  { timestamp: '2026-06-10T09:59:59.999Z', duration: 60, data: { app: 'BeforeEnd' } },
  { timestamp: '2026-06-10T10:00:00.000Z', duration: 60, data: { app: 'AtEnd' } },
]

Deno.test('filterEventsInRange keeps events in [start, end)', () => {
  const filtered = filterEventsInRange(events, START, END)

  assertEquals(filtered.length, 3)
  assertEquals(filtered.map((e) => e.data?.app), ['AtStart', 'Inside', 'BeforeEnd'])
})

Deno.test('filterEventsInRange excludes events before start and at end', () => {
  const filtered = filterEventsInRange(events, START, END)

  assertEquals(filtered.some((e) => e.data?.app === 'Before'), false)
  assertEquals(filtered.some((e) => e.data?.app === 'AtEnd'), false)
})

Deno.test('filterEventsInRange returns empty array for empty input', () => {
  assertEquals(filterEventsInRange([], START, END), [])
})

Deno.test('filterEventsInRange returns empty when no events match', () => {
  const filtered = filterEventsInRange(
    [{ timestamp: '2026-06-09T08:00:00.000Z', duration: 60, data: { app: 'Old' } }],
    START,
    END,
  )

  assertEquals(filtered, [])
})
