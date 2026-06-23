import { assertEquals, assertExists } from 'jsr:@std/assert@^1.0.13'
import {
  aggregateMeetingSessions,
  aggregateTopActivities,
  aggregateTopWebLinks,
  isWorkRelatedUrl,
  mergeTopActivities,
} from './aggregate.ts'
import type { RawEvent, TopActivity } from './types.ts'

Deno.test('isWorkRelatedUrl recognizes work domains', () => {
  assertEquals(isWorkRelatedUrl('https://github.com/example/repo'), true)
  assertEquals(isWorkRelatedUrl('https://api.github.com/repos'), true)
  assertEquals(isWorkRelatedUrl('https://linear.app/team/issue'), true)
  assertEquals(isWorkRelatedUrl('https://app.slack.com/client'), true)
  assertEquals(isWorkRelatedUrl('https://docs.example.github.io/page'), true)
})

Deno.test('isWorkRelatedUrl rejects leisure and invalid URLs', () => {
  assertEquals(isWorkRelatedUrl('https://youtube.com/watch?v=abc'), false)
  assertEquals(isWorkRelatedUrl('https://reddit.com/r/all'), false)
  assertEquals(isWorkRelatedUrl('not-a-url'), false)
})

Deno.test('aggregateTopActivities sorts by duration and respects limit', () => {
  const events: RawEvent[] = [
    { timestamp: '2026-06-10T08:00:00.000Z', duration: 100, data: { app: 'A', title: 'a' } },
    { timestamp: '2026-06-10T08:10:00.000Z', duration: 500, data: { app: 'B', title: 'b' } },
    { timestamp: '2026-06-10T08:20:00.000Z', duration: 300, data: { app: 'C', title: 'c' } },
    { timestamp: '2026-06-10T08:30:00.000Z', duration: 50, data: { app: 'D', title: 'd' } },
  ]

  const top = aggregateTopActivities(events, 'window', 2)

  assertEquals(top.length, 2)
  assertEquals(top[0].app, 'B')
  assertEquals(top[0].durationSeconds, 500)
  assertEquals(top[1].app, 'C')
})

Deno.test('aggregateTopActivities combines duplicate app and title', () => {
  const events: RawEvent[] = [
    {
      timestamp: '2026-06-10T08:00:00.000Z',
      duration: 100,
      data: { app: 'Cursor', title: 'jerry' },
    },
    {
      timestamp: '2026-06-10T08:30:00.000Z',
      duration: 200,
      data: { app: 'Cursor', title: 'jerry' },
    },
  ]

  const top = aggregateTopActivities(events, 'window')

  assertEquals(top.length, 1)
  assertEquals(top[0].durationSeconds, 300)
  assertEquals(top[0].eventCount, 2)
})

Deno.test('mergeTopActivities ranks across watchers and applies limit', () => {
  const perWatcher: TopActivity[] = [
    { watcher: 'window', app: 'A', title: 'a', durationSeconds: 100, eventCount: 1 },
    { watcher: 'web', app: 'B', title: 'b', durationSeconds: 500, eventCount: 1 },
    { watcher: 'vscode', app: 'C', title: 'c', durationSeconds: 300, eventCount: 1 },
  ]

  const merged = mergeTopActivities(perWatcher, 2)

  assertEquals(merged.length, 2)
  assertEquals(merged[0].app, 'B')
  assertEquals(merged[1].app, 'C')
})

Deno.test('aggregateTopWebLinks deduplicates URLs and accumulates duration', () => {
  const events: RawEvent[] = [
    {
      timestamp: '2026-06-10T08:00:00.000Z',
      duration: 100,
      data: { url: 'https://github.com/example/repo', title: 'repo' },
    },
    {
      timestamp: '2026-06-10T08:30:00.000Z',
      duration: 200,
      data: { url: 'https://github.com/example/repo#section', title: 'repo' },
    },
    {
      timestamp: '2026-06-10T09:00:00.000Z',
      duration: 50,
      data: { url: 'https://youtube.com/watch', title: 'video' },
    },
  ]

  const links = aggregateTopWebLinks(events)

  assertEquals(links.length, 1)
  assertEquals(links[0].url, 'https://github.com/example/repo')
  assertEquals(links[0].durationSeconds, 300)
  assertEquals(links[0].eventCount, 2)
})

Deno.test('aggregateMeetingSessions merges slices within gap and detects platform', () => {
  const events: RawEvent[] = [
    {
      timestamp: '2026-06-10T10:00:00.000Z',
      duration: 600,
      data: { url: 'https://meet.google.com/abc-defg-hij', title: 'Standup' },
    },
    {
      timestamp: '2026-06-10T10:08:00.000Z',
      duration: 300,
      data: { url: 'https://meet.google.com/abc-defg-hij', title: 'Standup' },
    },
    {
      timestamp: '2026-06-10T11:00:00.000Z',
      duration: 600,
      data: { url: 'https://zoom.us/j/123456789', title: 'Zoom call' },
    },
  ]

  const sessions = aggregateMeetingSessions(events)

  assertEquals(sessions.length, 2)

  const meet = sessions.find((s) => s.platform === 'google-meet')
  assertExists(meet)
  assertEquals(meet.eventCount, 2)
  assertEquals(meet.meetingCode, 'abc-defg-hij')

  const zoom = sessions.find((s) => s.platform === 'zoom')
  assertExists(zoom)
  assertEquals(zoom.meetingCode, '123456789')
})
