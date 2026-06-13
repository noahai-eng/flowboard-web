import { z } from 'zod'

// Geteiltes Schema fuer KI-generierte Karten-Vorschlaege (Spec 14).
// Route Handler (streamText Output.array) + Client (useObject) nutzen es.
export const cardSuggestionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.number().int().min(1).max(4).optional(),
})

export type CardSuggestion = z.infer<typeof cardSuggestionSchema>
