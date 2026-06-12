# Learning — Flow Board

Erkenntnisse, Stolpersteine, Abweichungen von erwarteten Docs. Hilft, Fehler
nicht zu wiederholen.

## Phase 0

- **create-next-app + Großbuchstaben im Ordnernamen:** `trello_clonEA` wird als
  Package-Name abgelehnt (npm erlaubt keine Capitals). Loesung: in gueltig
  benannten Unterordner (`flow-board`) scaffolden, Inhalt ins Root ziehen.
  Package-Name ist jetzt sauber `flow-board`.
- **shadcn-CLI-Flags geaendert:** Kein `--base-color`/`-b neutral` mehr. `-b` ist
  jetzt `--base radix|base` (Component-Library). Init via `-d` (Defaults,
  Preset `base-nova`). Base-Color steckt im Preset.
- **Next 16 bestaetigt** (16.2.9): Cookie-Refresh gehoert in `proxy.ts`, nicht
  `middleware.ts`. `next lint` ist raus → `eslint .`.
- **Monorepo statt separates Repo:** Web → `flow-board-web/`, Native → `flow-board-native/`
  (spaeter). Uebergreifende Doku im Root. npm-Befehle laufen im Workspace, nicht im Root.
  Root-`package.json` mit npm-Workspaces folgt, sobald Native startet.

## Phase 1-3 (Discovery, Sparring, Specs)

- **Supabase-MCP-Token war defekt:** Wert in `.mcp.json` war ein JWT (`eyJh…`) in `${}`
  gewickelt — die MCP braucht aber einen Personal Access Token (`sbp_…`). Muss vom User
  gefixt werden, bevor Spec 1 (Schema) baubar ist.
- **Discovery-Befund (Realtime):** DELETE bei Postgres Changes ist NICHT spaltenfilterbar
  (bei RLS nur PK im Payload) → DELETE lokal-optimistisch + PK-Abgleich oder Tombstone.
- **Discovery-Befund (DnD):** Motion `Reorder` + dnd-kit auf denselben Cards kollidieren.
  Entscheidung: **nur dnd-kit**, Animation via `motion layout`. Bewusste Abweichung vom
  Kickoff, dokumentiert in Spec 7.
- **Sparring-Entscheidung Position-Modell:** Integer-Gaps + Reindex (NICHT Fractional, das
  war die Discovery-Empfehlung). User-Entscheidung; Reindex in `move_card` gekapselt.
- **getClaims statt getUser** im Proxy (aktueller Supabase-Stand) — kein DB-Roundtrip bei
  asymmetrischen Keys.
- **dnd-kit hat zwei API-Generationen** (`@dnd-kit/core` klassisch vs `@dnd-kit/react` neu).
  Vor Spec 7 Versions-Reife prüfen.

## Spec 01 (Schema + RLS)

- **Supabase-MCP-Token endgueltig gefixt:** Es braucht einen Personal Access Token
  (`sbp_…`, von dashboard/account/tokens), NICHT den Publishable Key (`sb_publishable_…`)
  und keinen JWT. Wert direkt als String in `.mcp.json` (`--access-token`), KEIN `${}`.
  Zusaetzlich `--project-ref <ref>` ergaenzt → MCP laeuft projekt-gebunden, die
  Account-Level-Tools (`list_projects`, `list_organizations` …) verschwinden dann; mit
  `list_tables` testen statt `list_projects`. Reconnect erst NACH dem Speichern der Datei.
- **`now()` ist transaktions-konstant:** `updated_at`-Trigger im selben `begin/commit` wie
  der Insert zu testen schlaegt fehl (created_at == updated_at). Loesung: `updated_at`
  kuenstlich auf altes Datum setzen, dann Update → gegen das alte Datum vergleichen.
- **SECURITY DEFINER triggert Advisor:** `handle_new_user` war per `/rest/v1/rpc/...` fuer
  anon/authenticated aufrufbar (WARN). Fix: `revoke execute`. Trigger feuert trotzdem,
  da Trigger-Ausfuehrung kein EXECUTE-Grant braucht. Merkposten fuer kuenftige RPCs.
- **RLS-`with check` nicht via `execute_sql` testbar:** das MCP-SQL laeuft als privilegierte
  Rolle und umgeht RLS. Owner-Enforcement erst mit echtem authenticated-Client (Spec 2).

## Spec 02 (Auth)

- **proxy.ts gehoert bei src-Layout nach `src/proxy.ts`, NICHT ins Projekt-Root.**
  Spec 02 listete `flow-board-web/proxy.ts` — bei `src/app`-Struktur wird die Root-Datei
  NICHT erkannt (kein Compile, `/` lieferte 200 statt Redirect). Nach `src/` verschoben →
  funktioniert. Beim Verschieben `.next` loeschen (Turbopack cached die alte Pfad-Referenz,
  sonst 500 „Could not parse module proxy.ts, file not found").
- **Confirm-Email war im Projekt bereits AUS** — `signUp` liefert sofort eine Session.
  Per GoTrue-Endpoint (`/auth/v1/signup`) testbar (access_token im Response = AUS).
  Falls es bei einem anderen Projekt AN ist: Dashboard → Authentication → Sign In/Providers.
- **Zod 4:** Custom-Messages via `{ error: '...' }` (nicht `message`), `z.email()` statt
  `z.string().email()` (letzteres deprecated).
- **getClaims-Rueckgabe:** `data` kann null sein → `const { data } = ...; data?.claims`.
  Direktes `data: { claims }`-Destructuring failt im Typecheck.
- **redirect-Ziel `/board` existiert erst ab Spec 3** — Auth funktioniert, voller
  Click-Through (Sign-Up→Reload→Sign-Out) erst mit Base-Layout testbar.

## Spec 03 (Base-Layout)

- **`setState` synchron im `useEffect` = ESLint-Fehler** (`react-hooks/set-state-in-effect`).
  Mobile-Menue NICHT per `useEffect(() => setOpen(false), [pathname])` schliessen, sondern
  per `onClick` am Nav-Link (`onNavigate`-Callback). Lint-clean + weniger Re-Renders.
- **Authentifizierte Route ohne Browser testbar:** `@supabase/ssr`-Cookie nachbauen —
  Name `sb-<ref>-auth-token`, Wert `base64-` + base64url(JSON.stringify(session)), bei
  >3180 Zeichen chunked (`.0`, `.1`). Session via GoTrue `/auth/v1/signup` holen, Cookie
  setzen, Route mit `redirect:'manual'` abrufen → Shell rendert (200) statt /login-Redirect.
- **getClaims-Email:** `claims.email` ist `unknown`-artig typisiert → `typeof ... === 'string'`
  guard statt direktem Zugriff (sonst Typecheck-Stolperstein).
