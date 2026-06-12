// Gemeinsame Client-Typen fuer die Board-Ansicht (Listen + Cards).
// Wird ueber die Specs 5–9 erweitert (Cards, Labels, Priority).

export type CardLabel = {
  id: string
  name: string
  color: string
}

export type CardT = {
  id: string
  list_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: number | null
  position: number
  labels: CardLabel[]
}

export type ListT = {
  id: string
  title: string
  position: number
  cards: CardT[]
}

export type BoardT = {
  id: string
  title: string
}
