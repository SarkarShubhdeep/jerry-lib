import { assertEquals } from 'jsr:@std/assert@^1.0.13'
import { DEFAULT_OPENAI_MODEL, isAllowedOpenAiModel, OPENAI_MODEL_IDS } from './models.ts'

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
