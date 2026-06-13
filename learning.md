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

## Phase B (Specs 04–09, Kern-Kanban)

- **UI-Primitives liegen auf `@base-ui/react`** (Dialog/Menu/Select; Namespace-Import
  `import { Dialog } from '@base-ui/react/dialog'`, dann `Dialog.Root/Popup/...`).
  `lucide-react` + `motion` waren schon installiert. Kein shadcn-CLI noetig.
- **dnd-kit: klassische API** (`@dnd-kit/core` 6 + `@dnd-kit/sortable` 10), NICHT
  `@dnd-kit/react` (erst 0.5.0, unreif). Im Zweifel klassisch (breit dokumentiert).
- **DnD Off-by-one (Codex-Blocker):** Cross-List in `onDragOver` UND `arrayMove` in
  `onDragEnd` = doppeltes Verschieben. Loesung: Cross-List nur in onDragOver (richtungs-
  bewusst via `active.rect.translated` vs `over.rect`), Same-List nur in onDragEnd; ein
  `didCrossRef`-Flag trennt die Pfade.
- **`move_card`-RPC:** `SECURITY INVOKER` (RLS sichert Ownership), `set search_path=''`,
  `for update` auf bewegter Card, Anchor-Positionen frisch lesen, Reindex INLINE (keine
  zweite RPC exponieren). `now()`-Test-Artefakt siehe Spec 1.
- **Motion `layout`/`layoutId` NICHT auf dnd-kit-Cards** (Doppel-Transform, Discovery §B2).
  Card-Detail-Modal daher base-ui-Dialog + Scale/Fade statt Shared-Layout-Transition.
  Bewusste Spec-Abweichung, in Spec 8 begruendet.
- **RLS-Board-Scoping muss in der Policy stehen (Codex-Blocker), nicht nur in der Action:**
  `with check` braucht `exists(... boards/cards/labels ... owner = auth.uid())`, sonst
  koennen direkte PostgREST-Inserts Board-Grenzen umgehen. Gilt analog fuer lists/cards
  (dort nur action-seitig geprueft — contained, aber als Haertung im Backlog vormerken).
- **`.select().single()` nach update/delete:** ohne das liefert Supabase bei 0 betroffenen
  (RLS-)Rows KEINEN Fehler → optimistic State bliebe faelschlich. Mit `.single()` = Fehler.
- **Verifikation ohne Browser:** Datenschicht via PostgREST mit echtem User-`access_token`
  (identischer RLS-Pfad wie Server Actions) + SSR-Render via nachgebautem `sb-<ref>-auth-token`-
  Cookie. Server Actions selbst sind per curl kaum aufrufbar (verschluesselte Action-IDs).

## Phase C (Specs 10–16, MVP+ & Polish)

- **React `ViewTransition` ist in React 19.2.4 NICHT im Runtime-Export** (nur Typen in
  `@types/react/experimental.d.ts`). Next-`experimental.viewTransition` wuerde einen
  experimentellen React-Channel brauchen. Cross-Fade daher mit `motion` `AnimatePresence`
  (`mode="popLayout"`, keyed auf `usePathname`) im persistenten (app)-Layout geloest
  (`ViewFade`), reduced-motion-safe. Echtes Overlap-Crossfade ohne Router-Internals.
- **Generated `tsvector` braucht `'german'::regconfig`**, nicht `'german'` (text): der
  regconfig-Overload von `to_tsvector` ist IMMUTABLE (Pflicht fuer generated columns), der
  text-Overload nur STABLE → sonst Fehler beim `add column ... generated`.
- **Deutscher Snowball-Stemmer ist ein Light-Stemmer:** `Rechnungen`→`rechnung` matcht,
  aber `bezahlt`/`bezahlen` nicht (kein gemeinsamer Stamm). Erwartetes Postgres-Verhalten,
  kein Bug — Stemming-Tests mit Plural/Singular statt Verbformen waehlen.
- **Realtime: mehrere `postgres_changes`-Bindungen auf EINEM Channel feuern unzuverlaessig**
  (verifiziert: getrennte INSERT/UPDATE-gefiltert + DELETE-ungefiltert → nur DELETE kam an).
  Loesung: EINE `event:'*'`-Bindung mit `board_id`-Filter. Dank `replica identity full`
  traegt auch der DELETE-old-Record `board_id` → der Spaltenfilter matcht DELETE ebenfalls
  (entkraeftet die Discovery-Sorge, dass DELETE nicht filterbar sei). RLS verhindert Fremd-Board-Events.
- **AI SDK 6:** strukturierter Output via `generateText`/`streamText` + `Output.object` /
  `Output.array({ element })` (NICHT `generateObject`/`streamObject`). Client-Streaming von
  Arrays mit `experimental_useObject` (`@ai-sdk/react`) + `schema: z.array(element)` +
  `.toTextStreamResponse()`. Direktes Anthropic ueber `@ai-sdk/anthropic` (`ANTHROPIC_API_KEY`),
  Requesty als OpenAI-kompatibler Gateway ueber `@ai-sdk/openai-compatible`
  (`createOpenAICompatible`, baseURL `https://router.requesty.ai/v1`, `REQUESTY_API_KEY`).
- **Proxy & shared Endpunkte:** `/api/*` ohne Session → `401` statt `/login`-Redirect
  (Expo/HTTP-Clients). Landing-Route `'/'` VOR dem Auth-Gate behandeln: ausgeloggt public,
  eingeloggt → `/board`. Loop-frei, weil `/login`/`/signup`/Assets schon im `config.matcher`
  ausgenommen sind. `getClaims()` muss weiterhin direkt nach `createServerClient` stehen —
  neue Variablen/Helfer erst danach deklarieren.
- **base-ui Dialog unmountet den Popup beim Schliessen** → `useObject`-State (Generate-Dialog)
  setzt sich pro Oeffnen automatisch zurueck; kein manuelles Reset noetig.
- **AI-Provider-Fehler nicht als ganzes Objekt loggen** (koennen Request/Response-Header
  enthalten) — in der Action lokal fangen und nur `err.message` loggen (Key-Hygiene).
- **Requesty + Anthropic unterstuetzt KEIN `response_format` json_schema** (das `Output.object`
  emittiert): Live-Fehler „responseFormat is not supported … only supported with
  structuredOutputs" → `AI_NoObjectGeneratedError`. Loesung fuer Spec 15: striktes JSON im
  Prompt anfordern + serverseitig robust parsen (Code-Fences/Praefix tolerieren) und per Zod
  validieren. Spec 14 (direct Anthropic via `@ai-sdk/anthropic`) kann `Output.array` dagegen
  problemlos nutzen — die Einschraenkung liegt am Requesty-Gateway, nicht am Modell.
- **AI SDK `Output.array` Wire-Format:** `toTextStreamResponse()` streamt `{"elements":[…]}`
  (nicht ein nacktes Array). `experimental_useObject` mit `schema: z.array(element)` entpackt
  das transparent zur Array-`object`-Form. Beim Roh-Test der Response also auf `elements` pruefen.
