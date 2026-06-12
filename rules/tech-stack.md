# Tech-Stack — Flow Board

## Pflicht-Quelle: Context7 MCP

Bei **Auth, Realtime und AI-SDK** ist Context7 MCP fuer aktuelle Docs Pflicht —
Trainingsstand kann veraltet sein. Ebenso bei Supabase-SSR-Eigenheiten.

## Versionen (Stand Scaffold)

- Next.js **16.2.9** (App Router, in `flow-board-web/`) — Cookie-Refresh in `proxy.ts`, kein `next lint`.
- React **19.2.4**, TypeScript strict
- Tailwind **v4**, shadcn/ui (Style `base-nova`, Base-Color neutral), `tw-animate-css`
- Icons: `lucide-react`
- Motion: `motion/react` (frueher Framer Motion)
- DnD: dnd-kit (Cross-List) + Motion-`Reorder` (Same-List) — beide noch zu installieren
- DB + Auth: Supabase (Postgres + RLS, Email/Passwort), `@supabase/ssr`
- AI (Spec 14+): `ai` (AI SDK 6), `@ai-sdk/react`, `zod` — erst in AI-Specs installieren
- Deployment: Vercel · Package-Manager: npm

## Security-Modell

- `getClaims()` (in `proxy.ts`) oder RLS fuer Server-Sicherheitsentscheidungen.
- `auth.getUser()` nur, wenn der User-Record wirklich gebraucht wird.
- `getSession()` server-seitig **nie** als Sicherheitsentscheidung.
- Service-Role-Key nie im Client, nie in Logs.

## Was NICHT zum Stack gehoert

- Kein PWA / Serwist / Manifest / Service Worker (Native ersetzt das, eigenes Repo).
- Kein Husky, kein Pre-Commit-Hook.
- Kein `next lint`.
- Kein OAuth / Magic Link, kein Multi-User / Team / Sharing.

## MCPs / Tools

- Supabase MCP (full-access, `--scope project`)
- Context7 MCP (`--scope project`)
- shadcn MCP (Komponenten-Registry)
- Builder: Claude Code · Reviewer: Codex-Plugin
