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
  focus_slot: number | null
  is_focus_active: boolean
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

// Card in einer board-uebergreifenden Smart-View (Heute, Focus). Traegt
// zusaetzlich Board-Kontext, da diese Views Cards aus mehreren Boards mischen.
export type SmartCardT = CardT & {
  board_id: string
  board_title: string
}

// Treffer der Volltextsuche (Spec 12), board-uebergreifend.
export type SearchResultT = {
  id: string
  title: string
  board_id: string
  board_title: string
}
