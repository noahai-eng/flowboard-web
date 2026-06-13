import { anthropic } from '@ai-sdk/anthropic'
import { streamObject } from 'ai'

import { cardSuggestionSchema } from '@/lib/ai/card-suggestion'
import { createClient } from '@/lib/supabase/server'

// Spec 14: geteilter Route Handler (Web + spaeter Expo). Streamt mehrere
// Karten-Vorschlaege aus einem Freitext-Prompt (AI SDK 6, Output.array).
export const maxDuration = 30

// Direkt ueber @ai-sdk/anthropic -> liest ANTHROPIC_API_KEY aus der Server-Env.
const MODEL = 'claude-sonnet-4-6'
const MAX_PROMPT = 1000

export async function POST(req: Request) {
  // Auth: nur eingeloggte User (getClaims, kein Service-Role im Client).
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const rawPrompt = (body as { prompt?: unknown })?.prompt
  const prompt = typeof rawPrompt === 'string' ? rawPrompt.trim() : ''
  if (prompt.length === 0 || prompt.length > MAX_PROMPT) {
    return new Response('Invalid prompt', { status: 400 })
  }

  // streamObject mit output:'array' streamt partielles Array-JSON, das der Client
  // (experimental_useObject mit z.array(...)) direkt parst. streamText+Output.array
  // + toTextStreamResponse() lieferte dagegen {"elements":…} -> der Client bekam ein
  // Objekt statt eines Arrays (.filter-Crash). schema ist hier das ELEMENT-Schema.
  const result = streamObject({
    model: anthropic(MODEL),
    output: 'array',
    schema: cardSuggestionSchema,
    system:
      'Du bist ein Assistent, der aus einer Aufgaben-/Projektbeschreibung konkrete, ' +
      'umsetzbare Kanban-Karten erzeugt. Antworte auf Deutsch. Jede Karte hat einen ' +
      'praegnanten Titel (max 200 Zeichen), optional eine kurze Beschreibung und optional ' +
      'eine priority (1=dringend, 2=hoch, 3=mittel, 4=niedrig). Erzeuge 3 bis 7 sinnvolle Karten.',
    prompt,
  })

  return result.toTextStreamResponse()
}
