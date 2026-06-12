/**
 * External consumer smoke test (Deno + JSR).
 * Run from a clean directory after publish:
 *   deno init && deno add jsr:@sarkarshubhdeep/jerry-lib@0.1.0
 *   cp path/to/deno-smoke.ts . && deno check deno-smoke.ts
 */
import {
  buildActivitySummary,
  formatActivityContext,
  getPrompt,
  initJerryLib,
} from '@sarkarshubhdeep/jerry-lib'

initJerryLib()

const prompt = await getPrompt('prompts/ask.txt', '')
if (!prompt.includes('You are Jerry')) {
  throw new Error('shipped ask.txt did not load')
}

const summary = buildActivitySummary(
  [{ id: 'aw-watcher-window_host' }],
  {
    'aw-watcher-window_host': [{
      timestamp: '2026-06-10T10:00:00.000Z',
      duration: 60,
      data: { app: 'Cursor', title: 'smoke' },
    }],
  },
  { 'aw-watcher-window_host': 1 },
  {
    start: new Date('2026-06-10T09:00:00.000Z'),
    end: new Date('2026-06-10T12:00:00.000Z'),
    label: 'smoke',
  },
)

const ctx = formatActivityContext(summary)
if (!ctx.includes('Cursor')) {
  throw new Error('formatActivityContext failed')
}

console.log('deno-smoke ok')
