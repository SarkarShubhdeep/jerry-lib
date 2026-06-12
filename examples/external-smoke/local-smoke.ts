/**
 * Pre-publish smoke: validates consumer API from repo root.
 * Run: deno task smoke
 */
import {
  buildActivitySummary,
  formatActivityContext,
  getPrompt,
  initJerryLib,
} from '../../mod.ts'

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

console.log('local-smoke ok')
