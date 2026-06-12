# Spec 16 — Marketing-Landingpage

## Ziel
Öffentliche Startseite `/` (Hero + Feature-Cards) als Polish-Move. Eingeloggte User werden
von `/` auf `/board` umgeleitet — ohne Redirect-Loop.

## Abhängt von
Spec 02 (Auth/Proxy), Spec 03 (App-Bereich). Letzte Spec (Polish).

## Scope
- **Drin:** öffentliche Route `/`, Hero, Feature-Cards, CTA → `/signup`, Proxy-Redirect-Logik.
- **Draußen:** Blog, Pricing, Mehrsprachigkeit (out-of-scope).

## Routing / Redirect (kritisch — Loop vermeiden)
- `/` ist **öffentlich** (kein Auth-Gate).
- Proxy-Redirect: **nur `/`** bei eingeloggtem User → `/board`.
- **Explizit ausschließen** von Auth-/Redirect-Logik: `/login`, `/signup`, statische Assets
  (`_next/*`, Bilder, favicon). Sonst Redirect-Loop.
- `config.matcher` + Pfad-Checks entsprechend anpassen (mit Spec 02 abgleichen).

## UI / UX
- Hero: starke Headline, Subline, CTA-Button → `/signup`. Gradient-Hintergrund, Layering,
  weiche Shadows — Ziel-Niveau Linear/Cal.com.
- Feature-Cards: Boards/DnD, Smart-Views (Heute/Focus), AI-Generation — je Card Icon
  (Lucide) + kurzer Text.
- Dark-Theme-konsistent, `--radius`, Hover/Focus, Transitions ≥150ms.
- `100dvh`-Hero korrekt; reduced-motion respektieren.
- Responsiv (Mobile-Hero sauber).

## Akzeptanzkriterien
- [ ] `/` öffentlich erreichbar (ausgeloggt), kein Redirect.
- [ ] Eingeloggt + `/` → Redirect `/board`.
- [ ] `/login`, `/signup`, Assets lösen **keinen** Loop aus.
- [ ] CTA führt zu `/signup`. Hochwertiger Look (Design-System).
- [ ] Lighthouse: keine groben A11y-/Perf-Regressionen.

## Verification
typecheck · lint · Browser-Check (ein-/ausgeloggt, Loop-Test auf /login,/signup,/) ·
Codex-Review.
