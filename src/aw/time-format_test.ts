import { assertEquals, assertStringIncludes } from 'jsr:@std/assert@^1.0.13'
import { formatLocalTimeRange } from './time-format.ts'

Deno.test('formatLocalTimeRange formats same-day range with date and times', () => {
  const formatted = formatLocalTimeRange(
    '2026-06-10T15:00:00.000Z',
    '2026-06-10T15:30:00.000Z',
  )

  assertStringIncludes(formatted, '–')
  assertEquals(formatted.includes('Jun'), true)
})

Deno.test('formatLocalTimeRange formats cross-midnight range with both dates', () => {
  const formatted = formatLocalTimeRange(
    '2026-06-10T22:00:00.000Z',
    '2026-06-11T01:00:00.000Z',
  )

  const parts = formatted.split('–')
  assertEquals(parts.length, 2)
  assertEquals(formatted.includes('Jun'), true)
})

Deno.test('formatLocalTimeRange handles zero-minute span', () => {
  const formatted = formatLocalTimeRange(
    '2026-06-10T12:00:00.000Z',
    '2026-06-10T12:00:00.000Z',
  )

  assertStringIncludes(formatted, '–')
  assertEquals(formatted.length > 0, true)
})
