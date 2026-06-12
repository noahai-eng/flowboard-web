# Discovery — Flow Board (Phase 1)

Konsolidierte Findings aus 2 parallelen Sub-Agents (Quelle: Context7 MCP).
Stand: 2026-06-12. Bei Konflikten Vorwissen vs Context7 → Context7 gewinnt.

---

## A. Supabase SSR Auth + RLS + Realtime

### A1. @supabase/ssr Setup (Next 16)
- Drei Clients: `createBrowserClient` (Client Components), `createServerClient`
  (Server Components / Actions / Route Handlers).
- **`cookies()` ist in Next 16 async → `await cookies()` Pflicht.** Server-Client-Factory
  ist damit `async`, Aufruf immer `await createClient()`.
- Cookie-Handling über **`getAll`/`setAll`** (alte `get/set/remove` deprecated).
  `getAll` Pflicht; `setAll` in Server Components via `try/catch` (set dort nicht
  erlaubt → ok, solange `proxy.ts` refresht).
- Env-Var: aktuell **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** bevorzugt (statt `ANON_KEY`).
  Konsistent EINEN Namen wählen.

### A2. Next 16 proxy.ts + getClaims (bestätigt)
- `middleware.ts` → **`proxy.ts`** umbenannt; Export `middleware` → **`proxy`**.
  Config-Flags: `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`.
- **Proxy-Runtime ist `nodejs`, NICHT konfigurierbar — kein Edge.** Für `@supabase/ssr`
  + WebCrypto (`getClaims`) unkritisch.
- Auth-Check im Proxy via **`getClaims()`** (nicht mehr `getUser()`). **Kein Code
  zwischen `createServerClient` und `getClaims()`** — sonst zufällige Logouts.
  Der Aufruf treibt den Cookie-Refresh an.
- `supabaseResponse` unverändert zurückgeben (Cookies nicht anfassen), sonst
  Browser-/Server-Session out of sync.
- Pattern: `lib/supabase/proxy.ts` mit `updateSession(request)`, Root-`proxy.ts`
  ruft sie auf; `config.matcher` schließt static assets aus.

### A3. Auth Server Actions
- `'use server'` + `await createClient()`. `signInWithPassword`, `signUp`, `signOut`.
- Nach Auth-Statuswechsel `revalidatePath('/', 'layout')`, dann `redirect`.
- Inputs validieren (Zod). Sign-Out: vor `signOut()` `getClaims()` prüfen.

### A4. Security-Modell
- **`getSession()` server-seitig NIE als Security-Boundary** — keine krypto. Verifikation,
  Cookie manipulierbar.
- **`getClaims()`** = bevorzugter Server-Check. Asymmetrische Keys (RS256/ECC) →
  **lokale** JWT-Verifikation via WebCrypto, kein DB-Roundtrip (JWKS-Cache 10 Min).
  Symmetrische Keys (HS256) → Server-Roundtrip. Liefert `sub` (User-ID), `email`, `role` etc.
- **`getUser()`** nur wenn DB-User-Record gebraucht (garantierter DB-Roundtrip).
- Faustregel: Auth-Gate (Proxy, Server Components/Actions) → `getClaims()` → `claims.sub`.
  Datenabsicherung macht **RLS** (App-Check ist UX/Redirect, nicht letzte Linie).

### A5. RLS-Policies
- RLS aktivieren, Policy pro Operation. **Best Practice: `(select auth.uid())`** statt
  `auth.uid()` (initplan-cached, schneller). `to authenticated` einschränken.
- `using` = bestehende Zeilen (select/update/delete), `with check` = neue/geänderte
  Zeile (insert/update). Bei UPDATE beide.
- **Empfehlung Solo-User: direkte `owner`-Spalte (`auth.uid()`) auch auf `lists` und
  `cards`** (denormalisiert) statt EXISTS-Subqueries über board→list. Schneller,
  einfacher, und hilft bei Realtime-Filterung. Subquery-Variante (EXISTS join) als
  Alternative dokumentiert.

### A6. Realtime + DELETE-Eigenheiten (kritisch)
- Publication aktivieren: `alter publication supabase_realtime add table cards;`
  Für alte Werte bei UPDATE/DELETE: `alter table cards replica identity full;`
- Subscribe: `.channel(...).on('postgres_changes', {event:'*', table:'cards',
  filter:'board_id=eq.<id>'}, cb).subscribe()`. Callbacks **vor** `subscribe()`.
- **DELETE-Einschränkung:** RLS wird auf DELETE nicht angewandt; bei RLS+`replica
  identity full` wird **bei DELETE nur der PK** an Clients gesendet → **Spaltenfilter
  `board_id=eq.` matcht DELETE nicht zuverlässig.**
- **Lösung:** DELETE **lokal-optimistisch** (sofort aus State); für Cross-Device
  entweder DELETE **ohne** Spaltenfilter + Abgleich per PK, **oder Tombstone**
  (`deleted_at` → Löschen wird UPDATE, filterbar + RLS-konform, Hard-Delete-Cleanup separat).
- **Idempotenz:** eigenes INSERT kommt als Echo zurück → beim Anwenden **per Card-`id`
  upserten** (dedupe). Cleanup: `supabase.removeChannel(channel)` bei Unmount/Board-Wechsel.

---

## B. DnD-Position-Handling (Kanban)

### B1. dnd-kit Multi-Column-Pattern
- **Zwei API-Generationen existieren:** klassisch (`@dnd-kit/core` + `/sortable`:
  `DndContext`, `useSortable`, `closestCorners`, `arrayMove`) und neu
  (`@dnd-kit/react`: `DragDropProvider`, `useSortable({group,type,accept})`,
  `move()` aus `@dnd-kit/helpers`). **Nicht mischen.** Vor Wahl `npm view @dnd-kit/react version` prüfen.
- Ein `DndContext`/`DragDropProvider` ums Board, ein `SortableContext` pro Liste,
  Spalte als Droppable (für leere Listen). Collision: **`closestCorners`** für vertikale Spalten.
- **Cross-List via `onDragOver`** (Item live optimistisch in Zielspalte umhängen),
  **Same-List-Reorder + Persistenz via `onDragEnd`**. Folge: in `onDragEnd` sind
  finaler Container + Nachbar-Cards bekannt → **anhand Nachbarn (before/after-IDs)
  persistieren, nicht per Array-Index.**
- Sensors: PointerSensor (`activationConstraint.distance ~8px`, sonst Klicks = Drags)
  + KeyboardSensor (Accessibility). DragOverlay via Portal gegen Clipping.

### B2. Motion Reorder — NICHT mit dnd-kit mischen
- **Empfehlung: nur dnd-kit, kein Motion `Reorder`.** Zwei DnD-Systeme auf denselben
  Items → konkurrierende Pointer-Capture + Doppel-Transforms → springende Items.
- dnd-kit deckt Same-List-Reorder schon vollständig ab (inkl. Keyboard).
- Schöne Animationen trotzdem: **`<motion.* layout>`** auf Cards (reine Layout-Animation),
  **ohne** `Reorder`. Trennung: dnd-kit = Interaktion/Logik, Motion = Layout-Animation.
- ⚠️ Weicht vom Kickoff ab (dort: Motion `Reorder` für Same-List). Siehe Sparring.

### B3. Positionsmodelle
| | Integer-Gaps (Step 1000) | Fractional (text-Keys) |
|---|---|---|
| Storage | `bigint` | `text` (base-62) |
| Neue Pos | `(prev+next)/2` | `generateKeyBetween(a,b)` |
| Erschöpfung | Gap halbiert sich → Reindex nötig | Key wächst (`"a1V"`), nie erschöpft |
| Reindex | periodisch (Mehrzeilen-Update) | praktisch nie |
| Realtime | Reindex = Update-Sturm, andere laden Liste neu | 1 Move = 1 Zeile geändert |
| Nebenläufig | gleicher Mittelwert → Kollision | gleicher Key möglich → Tie-Break `id` |
| Aufwand | mittel (Reindex-Logik) | niedrig (`fractional-indexing`, rocicorp) |

### B4. move_card RPC
- **Anchor-basierte Signatur** (robuster als roher `new_position`):
  `move_card(p_card_id, p_target_list_id, p_before_card_id, p_after_card_id)`.
- Server liest Anchor-Positionen **frisch** (nicht Client vertrauen), `FOR UPDATE`
  gegen Races, **Same- und Cross-List = ein UPDATE** (nur `list_id` + neue `position`).
- Fractional: `position text not null`, Index `(list_id, position)`. Tie-Break
  `ORDER BY position, id` statt `UNIQUE(list_id, position)`.
- ⚠️ `generate_key_between` hat kein First-Party-Postgres-Modul: entweder in PL/pgSQL
  selbst implementieren ODER Key clientseitig erzeugen + Server liest Anchors frisch
  zur Stale-Absicherung. Trade-off → Spec 7.

### B5. Empfehlung (Discovery)
**Fractional Indexing (`text`-Position) + anchor-basierte `move_card`-RPC + nur dnd-kit.**
Gründe: 1 Move = 1 geänderte Zeile (ideal für Realtime), kein Reindex-Code,
Same/Cross-List derselbe Pfad, Solo-User entschärft fehlende Konvergenzgarantie
(Tie-Break `position, id`).

---

## Offene Punkte → Phase 2 Sparring / Specs
1. **DnD-Position-Modell:** Fractional (Discovery-Empfehlung) vs Integer-Gaps. → Sparring-Frage.
2. **Motion `Reorder` vs nur dnd-kit:** Discovery rät klar zu nur dnd-kit (+ `layout`).
   Weicht vom Kickoff ab → in Spec 7 festhalten.
3. **dnd-kit klassisch vs `@dnd-kit/react` (neu):** Versions-Reife prüfen → Spec 7.
4. **`generate_key_between` server- vs clientseitig** → Spec 7.
5. **Realtime DELETE:** optimistic + PK-Abgleich vs Tombstone → Spec 13 (vor Bau praktisch verifizieren).
6. **Env-Var-Name** (`PUBLISHABLE_KEY`) konsistent ab Spec 2.

## Quellen
- `/supabase/ssr`, `/supabase/auth`, `/websites/supabase`, `/vercel/next.js/v16.2.2`
- `/websites/dndkit` (+ `/clauderic/dnd-kit`), `/websites/motion_dev_react`,
  `/rocicorp/fractional-indexing` (Benchmark 97)
