# Spec 15 — Auto-Categorization

## Ziel
Vorschlag für Label + Priority einer Card per LLM (Haiku via Requesty). Vorschlag wird mit
Versions-Snapshot gespeichert; Anwenden nur, wenn die Card seitdem unverändert ist
(Optimistic-Concurrency).

## Abhängt von
Spec 09 (Labels/Priority), Spec 06 (Cards mit `updated_at`).

## Pflicht
**Context7 MCP** für AI-SDK + Requesty-Anbindung. Requesty kommt erst hier in den Stack
(Free-Tier-Budget im Blick).

## Ablauf
1. **Vorschlag erzeugen** (Server Action `suggestCategory(cardId)`):
   - Card lesen (Titel/Beschreibung) + aktuelles `updated_at` als Snapshot.
   - Haiku via Requesty: schlage `label`(aus Board-Labels) + `priority` vor.
   - Speichere Vorschlag in Tabelle `category_suggestions(card_id, suggested_label_id,
     suggested_priority, card_updated_at, created_at)` — **mit `card_updated_at`-Snapshot**.
2. **Anwenden** (RPC `apply_suggestion(suggestion_id)` mit Version-Check):
   ```sql
   -- nur anwenden, wenn Card seit dem Snapshot nicht verändert wurde
   apply_suggestion(p_suggestion_id uuid) returns cards
   -- intern: vergleicht suggestion.card_updated_at mit cards.updated_at;
   -- bei Mismatch -> Fehler "stale" (Vorschlag verworfen/neu erzeugen)
   ```

## Warum Server Action (nicht Route Handler)
Kein Streaming nötig, rein Web-getriggert (Categorization passiert im Web-UI). Falls Native
das später braucht → in Route Handler heben. Mutationskern liegt ohnehin in der RPC.

## UI / UX
- Card/Detail-Modal: „Auto-kategorisieren"-Aktion → zeigt Vorschlag (Label + Priority) zur
  Bestätigung. Apply oder Verwerfen.
- Bei „stale" (Card geändert): klare Meldung, Neu-Vorschlag anbieten.

## Sicherheit
- Requesty-/Anthropic-Key server-seitig, nie Client/Log. RLS auf `category_suggestions`
  (owner = auth.uid()).

## Akzeptanzkriterien
- [ ] Vorschlag wird erzeugt + mit `card_updated_at`-Snapshot gespeichert.
- [ ] Apply setzt Label + Priority nur bei unveränderter Card; sonst „stale".
- [ ] RLS auf suggestions; kein Key-Leak.

## Verification
typecheck · lint · Test (Apply nach zwischenzeitlicher Card-Änderung → stale) ·
`get_advisors` · Codex-Review.
