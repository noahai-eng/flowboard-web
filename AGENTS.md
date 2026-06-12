<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

Dieses Projekt laeuft auf **Next.js 16**. APIs, Konventionen und Datei-Struktur
koennen von deinem Trainingsstand abweichen. Lies bei Unsicherheit den passenden
Guide in `node_modules/next/dist/docs/` bevor du Code schreibst. Deprecation-Hinweise beachten.

Konkret fuer dieses Projekt:
- Cookie-Refresh laeuft in `proxy.ts` (Next 16), **nicht** in `middleware.ts`.
- `next lint` ist entfernt — wir nutzen `eslint .` direkt.
<!-- END:nextjs-agent-rules -->

# Flow Board

Projekt-Router und alle Regeln stehen in **`CLAUDE.md`**. Diese Datei dort lesen.
