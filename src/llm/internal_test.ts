import { assertEquals, assertThrows } from 'jsr:@std/assert@^1.0.13'
import {
  API_KEY_ERROR,
  buildClient,
  GEMINI_BASE_URL,
  requireApiKey,
  resolveModel,
} from './internal.ts'
import { DEFAULT_GEMINI_MODEL, DEFAULT_OPENAI_MODEL } from './models.ts'

Deno.test('requireApiKey throws API_KEY_ERROR for empty string', () => {
  assertThrows(() => requireApiKey(''), Error, API_KEY_ERROR)
})

Deno.test('requireApiKey throws API_KEY_ERROR for whitespace', () => {
  assertThrows(() => requireApiKey('   '), Error, API_KEY_ERROR)
})

Deno.test('requireApiKey returns trimmed key', () => {
  assertEquals(requireApiKey('  sk-test-key  '), 'sk-test-key')
})

Deno.test('resolveModel returns OpenAI default for unknown model (default provider)', () => {
  assertEquals(resolveModel('not-a-real-model'), DEFAULT_OPENAI_MODEL)
})

Deno.test('resolveModel passes through allowlisted OpenAI model', () => {
  assertEquals(resolveModel('gpt-4o'), 'gpt-4o')
})

Deno.test('resolveModel returns Gemini default for unknown model with gemini provider', () => {
  assertEquals(resolveModel('not-a-real-model', 'gemini'), DEFAULT_GEMINI_MODEL)
})

Deno.test('resolveModel passes through allowlisted Gemini model', () => {
  assertEquals(resolveModel('gemini-2.5-pro', 'gemini'), 'gemini-2.5-pro')
})

Deno.test('resolveModel falls back to Gemini default for OpenAI model with gemini provider', () => {
  assertEquals(resolveModel('gpt-4o', 'gemini'), DEFAULT_GEMINI_MODEL)
})

Deno.test('buildClient returns OpenAI client for default provider', () => {
  const client = buildClient('test-key')
  assertEquals(client.baseURL, 'https://api.openai.com/v1')
})

Deno.test('buildClient returns OpenAI client with Gemini baseURL for gemini provider', () => {
  const client = buildClient('test-key', 'gemini')
  assertEquals(client.baseURL, GEMINI_BASE_URL)
})
