# Codex-Review-Template

Wiederverwendbares Ritual fuer "Codex-nach-Spec". Pro Spec ausfuellen, damit
Reviews reproduzierbar und vergleichbar sind.

## Template

```
## Codex-Review: Spec NN — <feature>

**Spec-Bezug:** specs/NN-<feature>.md
**Branch:** feat/<...>
**Geaenderte Dateien:**
- <pfad>
- <pfad>

**Pruef-Fokus:**
- Erfuellt die Implementierung die Akzeptanzkriterien der Spec?
- Security: RLS / getClaims / kein Service-Role im Client / keine Secrets in Logs?
- Plattform-agnostisch: shared Logik in Route Handler / RPC, nicht Web-only verdrahtet?
- Design-System eingehalten (Tokens, Hover/Focus, Motion, reduced-motion)?
- Fehlerbehandlung nach rules/code-conventions.md?

**Test-Bezug:**
- typecheck: <pass/fail>
- lint: <pass/fail>
- funktional (Browser / Endpoint): <was geprueft>

**Findings:**
| # | Severity | Datei:Zeile | Befund | Vorschlag |
|---|----------|-------------|--------|-----------|
| 1 | Blocker  |             |        |           |
| 2 | Warning  |             |        |           |
| 3 | Nit      |             |        |           |
```

## Severity-Level

- **Blocker** — falsch / unsicher / verletzt Spec. Muss vor Merge gefixt werden.
- **Warning** — sollte gefixt werden, kein Merge-Stopper.
- **Nit** — Stil / Kleinigkeit, optional.

## Ablauf

1. Spec + Diff an Codex geben.
2. Template ausfuellen lassen.
3. Blocker zwingend, Warnings nach Abwaegung fixen.
4. Ergebnis-Kurznotiz in `changelog.md`.
