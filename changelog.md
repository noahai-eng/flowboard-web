# Changelog — Flow Board

Was pro Spec / Phase fertig wurde. Neueste Eintraege oben.

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
