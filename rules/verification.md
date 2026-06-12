# Verification — Flow Board

Self-Validation laeuft **nicht** ueber Git-Hooks (kein Husky, kein Pre-Commit).
Stattdessen pro Spec dieser Dreischritt:

## 1. Typecheck

```
npm run typecheck   # tsc --noEmit
```

Muss fehlerfrei sein, bevor eine Spec als fertig gilt.

## 2. Lint

```
npm run lint        # eslint .
```

Kein `next lint` (in Next 16 entfernt). Warnungen sichten, Errors fixen.

## 3. Codex-nach-Spec (Pflicht-Review)

- Nach jeder Spec ein Codex-Review nach dem Template in `rules/codex-review.md`.
- Default ist "Codex-nach-Spec": Review gegen die jeweilige `specs/NN-*.md`.
- Findings nach Severity (Blocker / Warning / Nit) abarbeiten. Blocker zwingend vor Merge.

## Funktionale Checks

- Auth-/Realtime-/AI-Flows zusaetzlich im Browser pruefen (Build-Loop, browser-use CLI).
- HTTP-Endpunkte (Route Handler) auch ohne Web-Client testbar halten (Expo nutzt sie spaeter).

## Reihenfolge pro Spec

Branch → Implementierung → typecheck → lint → Codex-Review → Fixes → Merge → `changelog.md` updaten.
