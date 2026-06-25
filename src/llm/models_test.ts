import { assertEquals } from 'jsr:@std/assert@^1.0.13'
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENAI_MODEL,
  GEMINI_MODEL_IDS,
  isAllowedGeminiModel,
  isAllowedOpenAiModel,
  OPENAI_MODEL_IDS,
} from './models.ts'

Deno.test('OPENAI_MODEL_IDS includes DEFAULT_OPENAI_MODEL', () => {
  assertEquals((OPENAI_MODEL_IDS as readonly string[]).includes(DEFAULT_OPENAI_MODEL), true)
})

Deno.test('isAllowedOpenAiModel accepts every allowlisted model', () => {
  for (const model of OPENAI_MODEL_IDS) {
    assertEquals(isAllowedOpenAiModel(model), true)
  }
})

Deno.test('isAllowedOpenAiModel rejects unknown models', () => {
  assertEquals(isAllowedOpenAiModel('gpt-unknown'), false)
  assertEquals(isAllowedOpenAiModel(''), false)
})

Deno.test('GEMINI_MODEL_IDS includes DEFAULT_GEMINI_MODEL', () => {
  assertEquals((GEMINI_MODEL_IDS as readonly string[]).includes(DEFAULT_GEMINI_MODEL), true)
})

Deno.test('isAllowedGeminiModel accepts every allowlisted model', () => {
  for (const model of GEMINI_MODEL_IDS) {
    assertEquals(isAllowedGeminiModel(model), true)
  }
})

Deno.test('isAllowedGeminiModel rejects unknown models', () => {
  assertEquals(isAllowedGeminiModel('gemini-unknown'), false)
  assertEquals(isAllowedGeminiModel(''), false)
  assertEquals(isAllowedGeminiModel('gpt-4o'), false)
})
