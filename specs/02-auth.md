# Spec 02 — Auth

## Ziel
Email/Passwort-Auth: Sign-Up, Sign-In, Sign-Out. Cookie-Refresh in `proxy.ts` mit
`getClaims()`. Geschützte Routen leiten Nicht-eingeloggte auf `/login`.

## Abhängt von
Spec 01 (profiles-Trigger). Supabase: Email-Provider an, Confirm-Email für Dev aus,
Site-URL `http://localhost:3000`.

## Pflicht
**Context7 MCP** für aktuelle `@supabase/ssr`-Patterns (siehe discovery.md §A1–A4).

## Scope
- **Drin:** `/login`, `/signup`, Sign-Out-Action, Supabase-Client-Factories, `proxy.ts`,
  Auth-Gate.
- **Draußen:** OAuth, Magic Link, Passwort-Reset (Backlog).

## Dateien
```
flow-board-web/src/lib/supabase/client.ts   # createBrowserClient
flow-board-web/src/lib/supabase/server.ts   # createServerClient (await cookies())
flow-board-web/src/lib/supabase/proxy.ts    # updateSession()
flow-board-web/proxy.ts                      # export async function proxy()
flow-board-web/src/app/(auth)/login/page.tsx
flow-board-web/src/app/(auth)/signup/page.tsx
flow-board-web/src/app/(auth)/actions.ts     # 'use server' login/signup/signout
```

## Kernpunkte (aus Discovery — exakt einhalten)
- `cookies()` ist async → `await createClient()` überall.
- Cookie-Handling via **getAll/setAll**.
- `proxy.ts`: **kein Code zwischen `createServerClient` und `getClaims()`**;
  `supabaseResponse` unverändert zurückgeben; `config.matcher` schließt static assets +
  `/login`, `/signup` aus.
- Auth-Check immer `getClaims()`, niemals `getSession()` server-seitig.
- Env-Var konsistent: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  in `.env.local` (nicht committen).

## Server Actions
- `signup(formData)`: `signUp({email,password})`, bei Fehler typisiertes Result, sonst
  `revalidatePath('/', 'layout')` + `redirect('/board')`.
- `login(formData)`: `signInWithPassword`, analog.
- `signout()`: `getClaims()` prüfen → `signOut()` → redirect `/login`.
- Inputs mit Zod validieren (Email-Format, Passwort min. 8 Zeichen).

## UI
- `/login` + `/signup`: hochwertige Auth-Cards (Design-System: Gradient-Layer, `--radius`,
  Focus-States), Fehleranzeige inline (keine Secrets in Messages).
- Link zwischen Login ↔ Signup.

## Akzeptanzkriterien
- [ ] Sign-Up legt User + profiles-Row an, leitet eingeloggt auf `/board`.
- [ ] Sign-In/-Out funktionieren; nach Sign-Out → `/login`.
- [ ] Aufruf geschützter Route ohne Session → Redirect `/login` (via proxy).
- [ ] Session überlebt Reload (Cookie-Refresh greift), kein „random logout".
- [ ] Kein Token/Key in Output, Code oder Logs.

## Verification
typecheck · lint · funktionaler Browser-Check (Sign-Up→Reload→Sign-Out) · Codex-Review.
