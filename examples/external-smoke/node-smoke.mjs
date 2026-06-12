/**
 * External consumer smoke test (Node + JSR npm alias).
 * Run after publish:
 *   npm init -y && npx jsr add @sarkarshubhdeep/jerry-lib@0.1.0
 *   node node-smoke.mjs
 */
import { initJerryLib, getPrompt } from '@sarkarshubhdeep/jerry-lib'

initJerryLib()

const prompt = await getPrompt('prompts/ask.txt', '')
if (!prompt.includes('You are Jerry')) {
  throw new Error('shipped ask.txt did not load')
}

console.log('node-smoke ok')
