'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { Loader2, Search } from 'lucide-react'

import { searchCards } from '@/app/(app)/search-actions'
import type { SearchResultT } from '@/lib/board-types'

type SearchBoxProps = {
  onNavigate?: () => void
}

// Volltextsuche (Spec 12): debounced Eingabe -> searchCards Server Action.
// Treffer board-uebergreifend; Klick oeffnet die Card auf ihrem Board (?card=).
export function SearchBox({ onNavigate }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultT[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Nur das jeweils letzte Ergebnis uebernehmen (Race bei schnellem Tippen).
  const reqIdRef = useRef(0)

  function onChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      reqIdRef.current++ // in-flight Antwort invalidieren
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(() => {
      const reqId = ++reqIdRef.current
      void searchCards(trimmed).then((result) => {
        if (reqId !== reqIdRef.current) return
        setLoading(false)
        setSearched(true)
        setResults('data' in result ? result.data : [])
      })
    }, 250)
  }

  function reset() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    reqIdRef.current++ // in-flight Antwort invalidieren
    setQuery('')
    setResults([])
    setSearched(false)
    setLoading(false)
    onNavigate?.()
  }

  const showPanel = query.trim().length > 0

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Karten suchen …"
          aria-label="Karten suchen"
          className="w-full rounded-xl border border-input bg-background/60 py-2 pl-8 pr-8 text-sm transition-colors duration-150 motion-reduce:transition-none hover:border-ring/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        />
        {loading ? (
          <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground motion-reduce:animate-none" />
        ) : null}
      </div>

      {showPanel ? (
        <div className="mt-1.5 space-y-0.5 rounded-xl border border-border/60 bg-card/60 p-1 shadow-lg shadow-black/20">
          {results.length > 0 ? (
            results.map((r) => (
              <Link
                key={r.id}
                href={`/board/${r.board_id}?card=${r.id}`}
                onClick={reset}
                className="block rounded-lg px-2.5 py-1.5 transition-colors duration-150 motion-reduce:transition-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                <span className="block truncate text-sm">{r.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {r.board_title}
                </span>
              </Link>
            ))
          ) : searched && !loading ? (
            <p className="px-2.5 py-2 text-xs text-muted-foreground">Keine Treffer.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
