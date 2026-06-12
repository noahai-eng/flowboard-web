# Flow Board — Native (Platzhalter)

Hier entsteht spaeter die **React-Native/Expo**-App. Noch nicht initialisiert —
kommt nach dem Web-MVP als eigener Schritt.

## Geplant (aus `architektur-entscheidung.md`)

- React Native via **Expo** + **Expo Router** + **NativeWind**
- **EAS Build** fuer iOS und Android
- **Dieselbe Supabase-DB** wie Web (RLS greift identisch), keine doppelte Datenhaltung
- **AI-Endpunkte wiederverwenden:** Native ruft die Web-Route-Handler via `expo/fetch` auf —
  kein eigener Native-AI-Code
- **Design-Tokens spiegeln 1:1** von `flow-board-web` (CSS-Variablen → NativeWind-Config)
- Builder fuer die Native-Phase: **Codex-Plugin** (Agent-Diversitaet als Qualitaetsmechanismus)

## Wichtig fuer die Web-Phase jetzt

Damit der Native-Schnitt spaeter billig bleibt:
- Geteilte Endpunkte (AI etc.) als **Route Handler** unter `flow-board-web/src/app/api/.../route.ts` bauen
- Mutationslogik in **Postgres-RPCs** oder shared Server-Funktionen kapseln
- Schema + APIs plattform-agnostisch halten
