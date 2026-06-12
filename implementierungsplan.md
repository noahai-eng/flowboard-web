# Implementierungsplan — Flow Board

> Skeleton-Stand (Phase 0). Die vollstaendige Arbeitspaket-Tabelle mit
> Reihenfolge-Begruendung wird in **Phase 3** nach Discovery + Sparring gefuellt.

## Projektbeschreibung

Flow Board ist eine persoenliche Kanban-App (Solo-User). User registriert sich mit
Email + Passwort, legt eigene Boards an; Boards haben Lists, Lists haben Cards.
Cards werden per Drag-and-Drop verschoben und haben Titel, Beschreibung, Due-Date,
Labels, Priority. Smart-Views (Heute, Focus) aggregieren Cards. Spaeter kommt eine
React-Native/Expo-App auf derselben Supabase-DB dazu — Schema + APIs daher
plattform-agnostisch.

## Arbeitspakete (Status)

Legende: ⬜ offen · 🟦 in Arbeit · ✅ fertig

| #  | Paket | Status |
|----|-------|--------|
| 0  | Projekt-Skeleton (Scaffold, Docs, Tooling) | ✅ |
| 1  | Schema + RLS | ⬜ |
| 2  | Auth | ⬜ |
| 3  | Base-Layout | ⬜ |
| 4  | Boards-CRUD | ⬜ |
| 5  | Lists-CRUD | ⬜ |
| 6  | Cards-CRUD | ⬜ |
| 7  | Cards-DnD | ⬜ |
| 8  | Card-Detail-Modal | ⬜ |
| 9  | Labels + Priority | ⬜ |
| 10 | Smart-View Heute | ⬜ |
| 11 | Focus-Mode | ⬜ |
| 12 | Full-Text Search | ⬜ |
| 13 | Realtime-Sync | ⬜ |
| 14 | Smart-Card-Generation | ⬜ |
| 15 | Auto-Categorization | ⬜ |
| 16 | Marketing-Landingpage | ⬜ |

## Reihenfolge-Begruendung

Folgt in Phase 3. Grundlinie: Daten + Auth zuerst (1-2), dann Sichtbarkeit (3),
dann CRUD-Kette Board → List → Card (4-6), dann Interaktion/Polish (7-9),
dann MVP+ Features (10-16) auf stabilem Fundament.
