# Changelog — Flow Board

Was pro Spec / Phase fertig wurde. Neueste Eintraege oben.

## Phase C — MVP+ & Polish, Specs 10–16 (2026-06-13)

Alle 7 Specs nacheinander implementiert, je einzeln Codex-reviewed, Findings gefixt;
ein gemeinsamer Commit am Ende (Wunsch fuer Ueberblick).

**Shared:** board-uebergreifende Smart-Views ueber `SmartCardT` + Hook
`useSmartCardActions` (optimistische Handler, wiederverwendet von Heute/Focus);
`CardT` um `focus_slot`/`is_focus_active` erweitert; Cross-Fade beim View-Wechsel via
`AnimatePresence` (`ViewFade`, mode `popLayout`, reduced-motion-safe) im persistenten
(app)-Layout; `database.types.ts` nach jeder DDL neu generiert.

- **10 Smart-View Heute:** SQL-View `today_cards` (`security_invoker`, User-TZ via
  `profiles.timezone`); Route `(app)/today`, Priority-Gruppen, Empty-State. Codex: echter
  Cross-Fade statt Fade-in (Blocker); View `left join` + `coalesce(timezone)` (fehlendes
  Profil); gepatchte Felder-Rollback-Guard.
- **11 Focus-Mode:** `focus_slot`/`is_focus_active` + Partial-Unique-Index (max 3, im Schema
  erzwungen) + CHECK (aktiv⇒Slot); RPC `set_focus` (SECURITY INVOKER, Slot-Tausch atomar,
  Owner-Rows `for update` gegen Races); Route `(app)/focus`, Slot-Auswahl im Detail-Modal.
  Codex: RPC-Lock, `selectedId`-Rollback, Focus-Ring auf Button, Section nur bei beiden Props.
- **12 Full-Text Search:** `cards.search` (generated `tsvector`, `'german'::regconfig`
  → immutable) + GIN-Index; `searchCards` (websearch, RLS); debounced SearchBox in der
  Sidebar, Treffer öffnen `/board/[id]?card=` (BoardView liest Param als Initial-State).
  Codex: in-flight-Request invalidieren bei clear/reset.
- **13 Realtime-Sync:** `cards` in Publication + `replica identity full`; Hook
  `useRealtimeCards` — EINE `event:'*'`-Bindung mit `board_id`-Filter (mehrere Bindungen
  feuern unzuverlässig; DELETE matcht dank replica-full den Filter), idempotenter id-Upsert,
  Cleanup via `removeChannel`; Reconcile-Guard gegen temp/real-Doppel. Codex: PASS.
- **14 Smart-Card-Generation:** Route Handler `api/cards/generate` (AI SDK 6 `streamText`
  + `Output.array`, `@ai-sdk/anthropic`, `ANTHROPIC_API_KEY` server-only), `getClaims`→401,
  Prompt-Limit; Client `useObject` mit Stagger (50ms, reduced-motion), Auswahl + Bulk-Persist
  `createGeneratedCards`. Proxy: `/api/*` ohne Session → 401 statt /login-Redirect (Expo).
  Codex: Append-Dedupe vs Realtime-Echo, valide-Vorschläge-Zählung, segmentgenauer /api-Check.
- **15 Auto-Categorization:** `category_suggestions` (+RLS) mit `card_updated_at`-Snapshot;
  RPC `apply_suggestion` (Versions-Check → `stale`, card_labels-RLS sichert Board-Scope);
  `suggestCategory` (Haiku via Requesty, `@ai-sdk/openai-compatible`, `REQUESTY_API_KEY`
  server-only) wählt nur existierende Board-Labels; AutoCategorize-Sektion im Modal, Apply
  aktualisiert nur lokalen State. Codex: LLM-Fehler nur als Message loggen (Key-Hygiene),
  Prompt-Injection-Härtung (Daten-Block), Label-Name trimmen.
- **16 Marketing-Landingpage:** öffentliche `/` (Hero, Feature-Cards, CTA→/signup); Proxy
  leitet NUR `/` für eingeloggte User → `/board`, `/login`/`/signup`/Assets ausgenommen
  (kein Loop). Codex: PASS.

**Verifikation je Spec:** typecheck + lint grün; Datenschicht via PostgREST mit echtem
User-Token (gleicher RLS-Pfad) + SSR-Render. 10: TZ-Grenzfälle (Kiritimati/Honolulu) +
RLS. 11: 4.-Slot/Unique-409, CHECK-400, RLS-400, Swap-Displace. 12: Stemming/websearch/
Phrase/RLS + EXPLAIN (GIN-Scan). 13: supabase-js Realtime INSERT/UPDATE/DELETE + kein
Fremd-Board-Leak. 14: 401/400 (Auth/Validation). 15: apply/stale/RLS via RPC. 16: Loop-Test
ein-/ausgeloggt. `get_advisors` nach jeder DDL ohne Findings. **Offen:** LLM-Happy-Path
(14 Stream, 15 Vorschlag) erst lauffähig, sobald `ANTHROPIC_API_KEY` + `REQUESTY_API_KEY`
in `.env.local` stehen.

## Phase B — Kern-Kanban, Specs 04–09 (2026-06-12)

Alle 6 Specs nacheinander implementiert, je einzeln Codex-reviewed, Findings gefixt;
ein gemeinsamer Commit am Ende (Wunsch fuer Ueberblick).

**Shared:** `safeAction`-Wrapper (`lib/action-result.ts`), Board-Client-Architektur
`BoardView` (optimistischer State fuer Listen/Cards/DnD/Labels), UI-Primitives auf
`@base-ui/react` (`ui/dialog`, `ui/dropdown-menu`, `ui/input`, `ui/textarea`,
`ui/confirm-dialog`), Icons via `lucide-react`. Mutationen ueber Server Actions mit
`.select().single()` (0-Row-RLS = Fehler).

- **04 Boards:** create/rename/delete (Server Actions), Board-Detail-Route, create-board-
  Dialog (Sidebar + Empty-State-CTA), board-menu (inline rename / delete-confirm).
  Codex: try/catch-Wrapper (`safeAction`), Input/Textarea-Hover, Sidebar-Copy.
- **05 Lists:** create/rename/delete, horizontale Spalten, add-list, delete-confirm bei
  nicht-leerer Liste. Codex-Blocker: Cards in Page laden (echte `cards.length`); 0-Row als Fehler.
- **06 Cards (Quick-Add):** Enter speichert + bleibt fokussiert, optimistisch mit id-Reconcile,
  inline edit, delete. Codex: `motion-safe` Hover, Focus-Ring auf Textareas.
- **07 DnD:** dnd-kit klassisch (core 6 + sortable 10; nicht @dnd-kit/react 0.5). `move_card`-
  RPC (SECURITY INVOKER, Integer-Gaps + inline Reindex, board_id-Sync). Codex-Blocker:
  Cross-List nur in onDragOver, Same-List nur in onDragEnd (Off-by-one behoben).
  Motion `layout`/`layoutId` bewusst weggelassen (Doppel-Transform mit dnd-kit, Discovery §B2).
- **08 Card-Detail-Modal:** base-ui-Dialog (Focus-Trap, Scale/Fade statt layoutId — s.o.),
  Titel/Beschreibung/Due-Date Auto-Save, Delete. Codex-Blocker: expliziter Close-Button;
  Rollback nur der gepatchten Felder; Gradient-Backdrop.
- **09 Labels + Priority:** labels + card_labels (RLS, Color-CHECK = `LABEL_COLORS`),
  `--label-*`-Tokens (Light/Dark oklch), Chips (color-mix) + Priority-Indikator, Label-Picker
  + Priority-Select im Modal. Codex-Blocker: Board-Scoping in RLS verankert (EXISTS statt nur
  Action-Check) — Cross-Board-Assign jetzt 403; assignLabel prueft Board-Zugehoerigkeit;
  unassignLabel revalidiert.

**Verifikation je Spec:** typecheck + lint gruen; Datenschicht via PostgREST mit echtem
User-Token (gleicher RLS-Pfad wie Actions) + SSR-Render via nachgebautem ssr-Cookie;
`move_card` per SQL/REST (Same/Cross/Reindex/RLS); `get_advisors` nach DDL ohne Findings
(ausser projektweitem `auth_leaked_password_protection` → backlog).

## Spec 03 — Base-Layout (2026-06-12)

- `(app)`-Route-Group mit Server-Layout `(app)/layout.tsx`: laedt RLS-gefilterte Boards
  + Email (getClaims) parallel, rendert App-Shell.
- `components/app-shell/sidebar.tsx` (Client): Brand, Smart-View-Platzhalter (Heute/Focus
  mit „Bald"-Badge), Board-Liste (Empty-State wenn leer), aktiver Nav-Zustand via
  usePathname + aria-current, responsive Off-Canvas auf Mobile (Topbar + Backdrop),
  Menue schliesst beim Nav-Klick (kein setState-in-Effect). Inline-SVG-Icons (kein Icon-Paket).
- `components/app-shell/user-menu.tsx` (Client): Avatar-Initiale, Email, Sign-Out via
  `signout`-Server-Action (form action).
- `(app)/board/page.tsx`: Willkommens-/Empty-State (Gradient-Layer).
- Root `app/page.tsx` → `redirect('/board')` (Next-Default-Page ersetzt).
- Design-System: Gradients/Layering, Hover+Focus auf allen Nav-Items, `motion-reduce`,
  `min-h-dvh`.
- Verifiziert: echte Session (nachgebautes @supabase/ssr-Cookie) → `/board` rendert Shell
  (Brand, Smart-Views, User-Menu, Email) mit 200; ohne Session `/board`+`/` → 307 `/login`.
  typecheck + lint gruen. Probe-User wieder geloescht.
- **Codex-Review:** keine Blocker. 1 Warning → gefixt: Board-Fetch-Fehler nicht mehr
  verschluckt (serverseitig geloggt + eigener Fehlerzustand in der Sidebar statt
  „keine Boards"). 1 Nit → gefixt: `aria-expanded`/`aria-controls` am Mobile-Menue-Button,
  `id` am `aside`.

## Spec 02 — Auth (2026-06-12)

- `@supabase/ssr`, `@supabase/supabase-js`, `zod` installiert.
- Client-Factories: `lib/supabase/client.ts` (Browser), `lib/supabase/server.ts`
  (async, `await cookies()`, getAll/setAll mit try/catch), `lib/supabase/proxy.ts`
  (`updateSession`, getClaims, kein Code zwischen createServerClient und getClaims).
- **Proxy liegt in `src/proxy.ts`** (NICHT Root — bei src-Layout sucht Next dort).
  Matcher schliesst static assets + `/login`/`/signup` aus. Auth-Gate: ohne Claims →
  Redirect `/login` (refreshte Cookies auf Redirect-Response uebernommen).
- Server Actions `(auth)/actions.ts`: login/signup (Zod-validiert, signInWithPassword/
  signUp, revalidatePath + redirect `/board`), signout (getClaims-Check → signOut →
  `/login`). Typisiertes `AuthState` fuer inline Fehler, keine Auth-Internals nach aussen.
- UI: `(auth)/login` + `(auth)/signup` (Server-Pages, leiten eingeloggte → `/board`),
  gemeinsame `auth-form.tsx` (Client, useActionState + Pending, Gradient-Layer, Focus-States).
- `.env.local` mit `NEXT_PUBLIC_SUPABASE_URL` + `_PUBLISHABLE_KEY` (gitignored).
- Verifiziert: `/` + `/board` ohne Session → 307 `/login`; `/login`+`/signup` 200;
  Confirm-Email ist im Projekt bereits AUS → echter signUp liefert Session und legt
  User + profiles-Row (tz Europe/Vienna) an (Probe-User wieder geloescht). typecheck+lint gruen.
- Offen bis Spec 3: Sign-Up/-In landen auf `/board` (Route existiert erst mit Base-Layout) —
  voller Browser-Click-Through (Reload/Sign-Out) dann.
- **Codex-Review (Spec 1+2):** keine Blocker. 1 Warning → gefixt: Migrations-SQL als
  Dateien in `supabase/migrations/` committet (vorher nur in Supabase + Changelog).
  2 Nits → gefixt: Submit-Button Gradient statt Flat-Fill, `motion-reduce:transition-none`
  auf Inputs/Link/Button. (typecheck-Sandbox-Hinweis war Artefakt; `*.tsbuildinfo` ist ignoriert.)

## Spec 01 — Schema + RLS (2026-06-12)

- 4 Migrationen via Supabase MCP `apply_migration`: `create_core_tables`,
  `enable_rls_policies`, `triggers_updated_at_and_new_user`,
  `revoke_execute_handle_new_user`.
- Tabellen profiles/boards/lists/cards mit Checks, Indizes (owner/board_id/list_id +
  position, board_id fuer Realtime), `owner`-Default `auth.uid()`.
- RLS auf allen 4 Tabellen, owner-Muster `(select auth.uid()) = owner` (profiles: = id),
  `for all to authenticated` mit `with check`.
- Trigger: `set_updated_at` (BEFORE UPDATE auf boards/lists/cards), `handle_new_user`
  (AFTER INSERT auf auth.users → profiles-Zeile). Beide mit `set search_path = ''`.
- Security-Advisor: `handle_new_user` (SECURITY DEFINER) war per REST-RPC aufrufbar →
  `revoke execute ... from public, anon, authenticated`. Advisor danach ohne Findings.
- TS-Typen → `flow-board-web/src/lib/supabase/database.types.ts`. typecheck + lint gruen.
- Funktional verifiziert (Transaktion + rollback): neuer auth-User bekommt profiles-Zeile
  (tz Europe/Vienna), `updated_at` wird bei Update gehoben. owner-`with check` erst mit
  Spec 2 (Auth) end-to-end testbar.

## Phase 1-3 — Discovery, Sparring, Specs (2026-06-12)

- Phase 1 Discovery: 2 parallele Sub-Agents (Supabase SSR/RLS/Realtime, DnD-Position),
  konsolidiert in `references/discovery.md` (Quelle: Context7 MCP).
- Phase 2 Sparring (3 Fragen): Position-Modell Integer-Gaps, Label-Preset-Palette,
  Quick-Add sofort speichern.
- Phase 3 Output: voller `implementierungsplan.md` (Arbeitspakete + Reihenfolge-Begruendung)
  + 16 Feature-Specs `specs/01..16`.
- Preflight-Befund: Supabase-MCP-Token defekt (muss gefixt werden), browser-use + Context7 ok.

## Phase 0 — Monorepo-Umbau (2026-06-12)

- Auf Monorepo umgestellt: Web-Scaffold nach `flow-board-web/` verschoben,
  `flow-board-native/` als Platzhalter angelegt (Expo kommt spaeter).
- Uebergreifende Doku (`rules/`, `specs/`, Logs, `architektur-entscheidung.md`) bleibt im Root.
- `.gitignore` gesplittet: app-spezifisch in `flow-board-web/.gitignore`, Root schlank.
- `architektur-entscheidung.md` um Abschnitt "Repo-Struktur (Monorepo)" ergaenzt
  (ersetzt frueheren "separates Repo"-Stand). CLAUDE.md, README, Rules-Pfade angepasst.

## Phase 0 — Skeleton (2026-06-12)

- Next.js 16.2.9 Scaffold (TS strict, Tailwind v4, App Router, src-dir, npm).
- shadcn/ui init (Style `base-nova`, Base-Color neutral): `components.json`,
  `src/lib/utils.ts`, `button.tsx`, Token-Set in `globals.css`.
- Design-Anpassung: `--radius: 1rem`, Dark Mode default (`.dark` am `<html>`),
  `min-h-dvh`, Theme-Platzhalter-Kommentar in `globals.css`.
- Dokumentations-Skeleton: `CLAUDE.md` (Router), `AGENTS.md` (Next-16-Warnung),
  `rules/` (design-system, code-conventions, verification, tech-stack, codex-review),
  `guidelines.md`, `specs/README.md`.
- Root-Logs angelegt: `implementierungsplan.md`, `backlog.md`, `changelog.md`, `learning.md`.
- Self-Validation-Scripts: `typecheck` (`tsc --noEmit`), `lint` (`eslint .`).
- Dev-Server-Smoke-Test: HTTP 200 auf localhost:3000.
