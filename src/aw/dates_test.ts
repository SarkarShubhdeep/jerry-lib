import { assertEquals, assertThrows } from 'jsr:@std/assert@^1.0.13'
import { NO_TIME_RANGE_ERROR, parseCalendarRangeFromPrompt } from './dates.ts'

Deno.test('parseCalendarRangeFromPrompt parses ISO single day', () => {
  const range = parseCalendarRangeFromPrompt('report for 2026-06-10')

  assertEquals(range !== null, true)
  assertEquals(range!.start.getFullYear(), 2026)
  assertEquals(range!.start.getMonth(), 5)
  assertEquals(range!.start.getDate(), 10)
  assertEquals(range!.label.includes('Jun'), true)
})

Deno.test('parseCalendarRangeFromPrompt parses ISO date range', () => {
  const range = parseCalendarRangeFromPrompt('2026-06-10 to 2026-06-12')

  assertEquals(range !== null, true)
  assertEquals(range!.start.getDate(), 10)
  assertEquals(range!.end.getDate(), 13)
  assertEquals(range!.label.includes('–'), true)
})

Deno.test('parseCalendarRangeFromPrompt parses named month single day', () => {
  const range = parseCalendarRangeFromPrompt('what did I do on June 1')

  assertEquals(range !== null, true)
  assertEquals(range!.start.getMonth(), 5)
  assertEquals(range!.start.getDate(), 1)
})

Deno.test('parseCalendarRangeFromPrompt parses named month range', () => {
  const range = parseCalendarRangeFromPrompt('May 10 to May 13 2026')

  assertEquals(range !== null, true)
  assertEquals(range!.start.getMonth(), 4)
  assertEquals(range!.start.getDate(), 10)
  assertEquals(range!.end.getMonth(), 4)
  assertEquals(range!.end.getDate(), 14)
})

Deno.test('parseCalendarRangeFromPrompt returns null for unrecognized input', () => {
  assertEquals(parseCalendarRangeFromPrompt('what did I work on'), null)
})

Deno.test('NO_TIME_RANGE_ERROR documents expected prompt examples', () => {
  assertThrows(
    () => {
      throw new Error(NO_TIME_RANGE_ERROR)
    },
    Error,
    'time range',
  )
})
