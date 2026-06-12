# Spec 12 — Full-Text Search

## Ziel
Volltextsuche über Cards (Titel + Beschreibung), deutschsprachig. Schnelle Suche via
Postgres `tsvector` + GIN-Index.

## Abhängt von
Spec 06/08 (Card-Titel + Beschreibung).

## Schema (Migration)
```sql
alter table cards add column search tsvector
  generated always as (
    to_tsvector('german',
      coalesce(title,'') || ' ' || coalesce(description,''))
  ) stored;

create index cards_search_gin on cards using gin (search);
```
Generated Column → Index bleibt automatisch aktuell, kein Trigger nötig.

## Server Action
```ts
// websearch_to_tsquery erlaubt natürliche Eingaben ("foo -bar \"exakt\"")
'use server'
export async function searchCards(query: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .textSearch('search', query, { type: 'websearch', config: 'german' })
  // RLS filtert auf eigene Cards
  return error ? { error } : { data }
}
```
Query via `websearch_to_tsquery('german', $1)`.

## UI / UX
- Such-Input (z.B. in der Sidebar/Topbar, Cmd/Ctrl+K-Affordance optional).
- Ergebnisliste board-übergreifend; Klick öffnet Card-Detail.
- Debounce der Eingabe; Empty-State bei keinem Treffer.
- Reduced-Motion respektieren.

## Akzeptanzkriterien
- [ ] Suche findet Cards nach Titel + Beschreibung (deutsche Stemming-Treffer).
- [ ] `websearch`-Syntax funktioniert (Phrasen, Ausschluss).
- [ ] Nur eigene Cards (RLS); GIN-Index wird genutzt (EXPLAIN prüfen).
- [ ] Performant bei vielen Cards.

## Verification
typecheck · lint · SQL-Test (Stemming, websearch) · EXPLAIN (Index-Nutzung) · Codex-Review.
