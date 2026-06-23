import { assertEquals, assertThrows } from 'jsr:@std/assert@^1.0.13'
import { API_KEY_ERROR, requireApiKey, resolveModel } from './internal.ts'
import { DEFAULT_OPENAI_MODEL } from './models.ts'

Deno.test('requireApiKey throws API_KEY_ERROR for empty string', () => {
  assertThrows(() => requireApiKey(''), Error, API_KEY_ERROR)
})

Deno.test('requireApiKey throws API_KEY_ERROR for whitespace', () => {
  assertThrows(() => requireApiKey('   '), Error, API_KEY_ERROR)
})

Deno.test('requireApiKey returns trimmed key', () => {
  assertEquals(requireApiKey('  sk-test-key  '), 'sk-test-key')
})

Deno.test('resolveModel returns default for unknown model', () => {
  assertEquals(resolveModel('not-a-real-model'), DEFAULT_OPENAI_MODEL)
})

Deno.test('resolveModel passes through allowlisted model', () => {
  assertEquals(resolveModel('gpt-4o'), 'gpt-4o')
})
