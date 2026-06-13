# Implementierungsplan — Flow Board

## Projektbeschreibung

Flow Board ist eine persoenliche Kanban-App (Solo-User). User registriert sich mit
Email + Passwort, legt eigene Boards an; Boards haben Lists, Lists haben Cards.
Cards werden per Drag-and-Drop verschoben und haben Titel, Beschreibung, Due-Date,
Labels, Priority. Smart-Views (Heute, Focus) aggregieren Cards. AI-Features
generieren und kategorisieren Cards. Web jetzt (`flow-board-web`), React-Native/Expo
spaeter (`flow-board-native`) auf derselben Supabase-DB — Schema + APIs daher
plattform-agnostisch, geteilte Endpunkte als Route Handler, Mutationen in Postgres-RPCs.

## Architektur-Eckpfeiler (aus Discovery + Sparring)

- **Auth:** `@supabase/ssr`, Cookie-Refresh in `proxy.ts` (Next 16), Auth-Checks via
  `getClaims()`. Sign-Up/In/Out als Server Actions.
- **Sicherheit:** RLS als primaere Grenze, direkte `owner`-Spalte (`auth.uid()`) auf
  boards/lists/cards (Solo-User, schnell, Realtime-tauglich).
- **Position-Modell:** Integer-Gaps (`bigint`, Schritt 1000) + Reindex, gekapselt in
  atomarer RPC `move_card`. (Sparring-Entscheidung; Fractional verworfen.)
- **DnD:** ausschliesslich dnd-kit (Cross- und Same-List). Kein Motion `Reorder`
  (Discovery: zwei DnD-Systeme auf denselben Items = Konflikte). Animation via `motion layout`.
- **Realtime:** Postgres Changes auf `cards`, Filter `board_id=eq.`. DELETE
  lokal-optimistisch + PK-Abgleich (DELETE nicht spaltenfilterbar). Idempotenz per id-Upsert.
- **Labels:** Preset-Palette als Design-Tokens.
- **AI:** Route Handler (`streamText` + `Output.array`) fuer Generation; Server Action
  (Haiku via Requesty) fuer Auto-Categorization mit Version-Check.

## Arbeitspakete (Status)

Legende: ⬜ offen · 🟦 in Arbeit · ✅ fertig

| #  | Paket | Spec | Status |
|----|-------|------|--------|
| 0  | Projekt-Skeleton (Scaffold, Docs, Monorepo, Tooling) | — | ✅ |
| 1  | Schema + RLS | `01-schema-rls.md` | ✅ |
| 2  | Auth | `02-auth.md` | ✅ |
| 3  | Base-Layout | `03-layout.md` | ✅ |
| 4  | Boards-CRUD | `04-boards.md` | ✅ |
| 5  | Lists-CRUD | `05-lists.md` | ✅ |
| 6  | Cards-CRUD (Quick-Add) | `06-cards.md` | ✅ |
| 7  | Cards-DnD | `07-dnd.md` | ✅ |
| 8  | Card-Detail-Modal | `08-card-detail.md` | ✅ |
| 9  | Labels + Priority | `09-labels-priority.md` | ✅ |
| 10 | Smart-View Heute | `10-smart-view-heute.md` | ✅ |
| 11 | Focus-Mode | `11-focus-mode.md` | ✅ |
| 12 | Full-Text Search | `12-fts.md` | ✅ |
| 13 | Realtime-Sync | `13-realtime-sync.md` | ✅ |
| 14 | Smart-Card-Generation | `14-smart-card-generation.md` | ✅ (LLM-Call braucht `ANTHROPIC_API_KEY`) |
| 15 | Auto-Categorization | `15-auto-categorize.md` | ✅ (LLM-Call braucht `REQUESTY_API_KEY`) |
| 16 | Marketing-Landingpage | `16-marketing-landingpage.md` | ✅ |

## Reihenfolge-Begruendung

1. **Fundament zuerst (1-2):** Ohne Schema + RLS und Auth ist nichts testbar. RLS
   muss VOR jedem CRUD stehen, sonst baut man gegen ungesicherte Tabellen.
2. **Sichtbarkeit (3):** Base-Layout (App-Shell, Auth-Gate, Navigation) gibt den
   Rahmen, in dem alle Features leben.
3. **CRUD-Kette Board → List → Card (4-6):** strikt in Hierarchie-Reihenfolge, weil
   jede Ebene die darunter referenziert (FK). Quick-Add schliesst die Erfassung ab.
4. **Interaktion + Polish (7-9):** DnD braucht existierende Cards + Listen; Detail-Modal
   braucht Cards; Labels/Priority erweitern das Card-Modell. Erst jetzt, weil sie auf
   stabiler CRUD-Basis aufsetzen.
5. **MVP+ (10-16):** Smart-Views + Focus brauchen das volle Card-Modell (Due-Date,
   Priority). FTS braucht Cards. Realtime setzt auf bestehende Mutationen auf. AI-Features
   ganz hinten, weil sie das reichste Modell + Endpunkt-Infrastruktur voraussetzen.
   Landingpage zuletzt als Polish-Move (oeffentliche Route + Proxy-Redirect-Logik).

## Build-Ritual pro Spec

Branch (`feat/NN-*`) → Implementierung → `npm run typecheck` + `npm run lint`
(in `flow-board-web/`) → Codex-Review (`rules/codex-review.md`) → Fixes → funktionaler
Check (Browser / Endpoint) → Merge → `changelog.md` (+ ggf. `learning.md`) updaten.
