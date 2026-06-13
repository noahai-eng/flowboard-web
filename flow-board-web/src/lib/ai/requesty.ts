import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

// Requesty ist ein OpenAI-kompatibler LLM-Gateway. Key nur server-seitig
// (REQUESTY_API_KEY), nie im Client. Modell-Id kann hier angepasst werden.
export const requesty = createOpenAICompatible({
  name: 'requesty',
  apiKey: process.env.REQUESTY_API_KEY,
  baseURL: 'https://router.requesty.ai/v1',
})

export const REQUESTY_MODEL = 'anthropic/claude-haiku-4-5-20251001'
