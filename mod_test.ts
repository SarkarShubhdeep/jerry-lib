import { assertEquals } from 'jsr:@std/assert@^1.0.13'
import {
  aggregateMeetingSessions,
  aggregateTopActivities,
  aggregateTopWebLinks,
  ask,
  buildActivitySummary,
  clearAssetCache,
  DEFAULT_OPENAI_MODEL,
  filterEventsInRange,
  formatActivityContext,
  formatActivityWindowLog,
  generateReport,
  getPrompt,
  initAssets,
  initJerryLib,
  isAllowedOpenAiModel,
  isWorkRelatedUrl,
  mentionsFullHistory,
  mentionsYesterday,
  mergeTopActivities,
  OPENAI_MODEL_IDS,
  pickBucket,
  recheckReport,
  resolveActivityRange,
  resolveRangeHours,
  watcherFromBucketId,
} from './mod.ts'

Deno.test('public API exports core functions', () => {
  assertEquals(typeof ask, 'function')
  assertEquals(typeof generateReport, 'function')
  assertEquals(typeof recheckReport, 'function')
  assertEquals(typeof initJerryLib, 'function')
  assertEquals(typeof buildActivitySummary, 'function')
  assertEquals(typeof formatActivityContext, 'function')
  assertEquals(typeof resolveActivityRange, 'function')
  assertEquals(typeof getPrompt, 'function')
  assertEquals(typeof initAssets, 'function')
  assertEquals(typeof clearAssetCache, 'function')
})

Deno.test('public API exports ActivityWatch helpers', () => {
  assertEquals(typeof aggregateTopActivities, 'function')
  assertEquals(typeof mergeTopActivities, 'function')
  assertEquals(typeof aggregateTopWebLinks, 'function')
  assertEquals(typeof aggregateMeetingSessions, 'function')
  assertEquals(typeof isWorkRelatedUrl, 'function')
  assertEquals(typeof filterEventsInRange, 'function')
  assertEquals(typeof pickBucket, 'function')
  assertEquals(typeof watcherFromBucketId, 'function')
  assertEquals(typeof formatActivityWindowLog, 'function')
  assertEquals(typeof mentionsYesterday, 'function')
  assertEquals(typeof mentionsFullHistory, 'function')
  assertEquals(typeof resolveRangeHours, 'function')
})

Deno.test('public API model allowlist includes default model', () => {
  assertEquals(OPENAI_MODEL_IDS.length > 0, true)
  assertEquals(isAllowedOpenAiModel(DEFAULT_OPENAI_MODEL), true)
})

Deno.test('initJerryLib accepts empty options without throwing', () => {
  initJerryLib({})
})
