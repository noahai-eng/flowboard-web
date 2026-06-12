# Spec 14 — Smart-Card-Generation

## Ziel
Aus einem Freitext-Prompt („Plane meinen Produkt-Launch") mehrere Cards generieren —
gestreamt, sodass Cards einzeln eintreffen. **Route Handler** (Web + Expo teilen den Endpunkt).

## Abhängt von
Spec 06 (Cards anlegen). Spec 09 optional (Labels/Priority in Vorschlägen).

## Pflicht
**Context7 MCP** für AI SDK 6. Dependencies (in `flow-board-web`):
`npm install ai @ai-sdk/react zod`.

## Warum Route Handler (nicht Server Action)
Geteilter HTTP-Endpunkt für Web **und** spätere Expo-App (`expo/fetch`). Server Actions
sind Web-only — siehe `architektur-entscheidung.md` / `rules/code-conventions.md`.

## Endpunkt
```
flow-board-web/src/app/api/cards/generate/route.ts
```
```ts
import { streamText, Output } from 'ai'
import { z } from 'zod'

const cardSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  priority: z.number().min(1).max(4).optional(),
})

export async function POST(req: Request) {
  // Auth: getClaims() über Server-Client; nur eingeloggt
  const { prompt, listId } = await req.json()
  const result = streamText({
    model: /* aktuelles Claude-Modell, siehe Context7/claude-api */,
    output: Output.array({ element: cardSchema }),
    prompt,
  })
  return result.toTextStreamResponse?.() ?? result.toUIMessageStreamResponse()
}
```
(Exakte Stream-Response-API über Context7 AI-SDK-6 verifizieren.)

## Client
```ts
import { experimental_useObject as useObject } from '@ai-sdk/react'
const { object, submit } = useObject({ api: '/api/cards/generate', schema: z.array(cardSchema) })
```
- Pro fertig eingetroffener Card optimistisch in die Ziel-Liste rendern.
- **Stagger-Animation:** `transition={{ delay: index * 0.05 }}` (50ms) pro Card.
- „Übernehmen"-Schritt: gewählte Vorschläge via `createCard` persistieren (oder Bulk-RPC).

## Sicherheit
- Endpunkt nur für eingeloggte User (`getClaims()`), Rate-/Längen-Limit auf Prompt.
- AI-Key (Anthropic/Requesty) nur server-seitig, nie im Client, nie in Logs.

## Akzeptanzkriterien
- [ ] Prompt → mehrere Cards streamen einzeln ein (sichtbarer Stagger 50ms).
- [ ] Übernommene Cards landen korrekt in der Liste (Position, owner, RLS).
- [ ] Endpunkt ohne Session → 401.
- [ ] Kein Key im Client/Log. Reduced-Motion respektiert.

## Verification
typecheck · lint · Endpoint-Test (curl ohne/ mit Session) · Browser-Check (Stream+Stagger) ·
Codex-Review.
