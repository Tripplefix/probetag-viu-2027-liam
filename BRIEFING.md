# Briefing: News-Wall für die Gemeinde Musterwil

Willkommen bei viu! Heute arbeitest du an einem kleinen Kundenauftrag. Die Gemeinde Musterwil ist fiktiv, die Situation ist aber typisch für unsere Projekte in der öffentlichen Verwaltung.

## Ausgangslage

Die Kommunikationsabteilung der Gemeinde Musterwil möchte ihre internen News im Intranet als übersichtliche Kacheln zeigen. Bisher lagen die News in einem alten Newsletter-Tool. Neu sollen sie von mehreren Personen in einer SharePoint-Liste erfasst werden. Den Export aus dem alten Tool findest du in `server/data/news.json`.

Du baust beides: die SharePoint-Liste mit Anbindung und das Frontend.

## Anforderungen

### Muss, Vormittag

1. Eine SharePoint-Liste für die News auf der Site [viu-probetag-2027](https://viuteam.sharepoint.com/sites/viu-probetag-2027) erstellen und mit den Daten aus dem alten Tool befüllen. Welche Spalten du anlegst, entscheidest du.
2. Das Backend mit der Liste verbinden: `GET /api/news` liefert die News aus SharePoint, im bestehenden Format. Die Stelle dafür ist `server/src/sources/sharepoint.js`.
3. News als Cards mit Titel, Kategorie, Teaser, Bild und Datum, responsive.

Solange die Verbindung zu SharePoint nicht steht, kannst du das Frontend mit den Testdaten weiterbauen (`DATA_SOURCE=mock`).

### Muss, Nachmittag

4. Die App funktioniert mit den echten Daten, auch wenn diese nicht sauber sind.
5. Die App ist für alle Mitarbeitenden nutzbar, auch mit Tastatur und Screenreader.
6. Filter nach Kategorie und Suche über Titel und Inhalt.
7. Wichtige News sollen auffallen.
8. Mindestens drei automatisierte Tests für die Filter- und Suchlogik.

### Kann

- News als «gelesen» markieren. Wo dieser Zustand gespeichert wird, entscheidest du und begründest es.

## Lieferobjekte

- Dein Code in diesem Repository
- Ein Abschnitt «Entscheide und Annahmen» in der `README.md`: Was hast du wie entschieden und warum?
- Das ausgefüllte `KI-LOGBUCH.md`
- 10 Minuten Präsentation um 15:45

## Zeitplan

| Zeit        | Was                                                       |
| ----------- | --------------------------------------------------------- |
| 09:30-09:50 | Briefing lesen, Fragen stellen, Plan skizzieren (ohne KI) |
| 09:50-12:00 | Umsetzung Teil 1                                          |
| 12:00-13:00 | Mittag                                                    |
| 13:00-13:20 | Zwischenstand mit dem Kunden                              |
| 13:20-15:30 | Umsetzung Teil 2                                          |
| 15:30-15:45 | Abgabe vorbereiten                                        |
| 15:45       | Präsentation                                              |

## Spielregeln

- **Claude ist erwünscht**, für Code, Recherche und Konzept, im Chat oder mit Claude Code. Andere KI-Tools bitte nicht.
- **Ohne KI** sind nur die ersten 20 Minuten (Briefing lesen und planen) und die Präsentation.
- **Fragen sind willkommen.** Faustregel: 15 Minuten selbst versuchen (auch mit Claude), dann fragen. Unklare Anforderungen darfst und sollst du klären.
- **Daten:** Gib Claude nur Daten aus diesem Repository, keine persönlichen Daten.
- **Transparenz:** Wir schauen uns am Schluss gemeinsam an, wie du mit Claude gearbeitet hast. Es geht nicht darum, wie viel die KI gemacht hat, sondern wie du sie geführt und ihr Resultat geprüft hast.

## Technische Infos

### Starten

```bash
npm run install:all
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Tests: `npm test` (Vitest und Testing Library sind eingerichtet)

### SharePoint und Authentifizierung

- Site: https://viuteam.sharepoint.com/sites/viu-probetag-2027 (du bist mit deinem Probetag-Account Mitglied)
- Für das Backend gibt es eine vorbereitete App-Registrierung in Entra ID

### API

`GET /api/news` liefert ein Array von News. Dieses Format erwartet das Frontend, egal ob die Daten aus den Testdaten oder aus SharePoint kommen:

| Feld        | Typ              | Bemerkung                                  |
| ----------- | ---------------- | ------------------------------------------ |
| `id`        | number           | Eindeutige ID                              |
| `title`     | string           | Titel                                      |
| `content`   | string           | Rich Text, kann HTML enthalten             |
| `category`  | string           | Laut Kunde: `Event`, `Projekt` oder `Info` |
| `priority`  | string oder null | `Hoch` oder `Normal`                       |
| `imageUrl`  | string oder null | URL des Bildes                             |
| `imageAlt`  | string oder null | Bildbeschreibung                           |
| `createdAt` | string           | Publikationsdatum, ISO 8601 in UTC         |

Das TypeScript-Interface liegt in `client/src/types/news.ts`, der API-Aufruf in `client/src/api/newsApi.ts`.

Hilfs-Parameter zum Testen von Zuständen:

- `GET /api/news?empty=1` liefert eine leere Liste
- `GET /api/news?fail=1` simuliert einen Serverfehler

### Wo du arbeitest

- Komponenten in `client/src/components/`
- Einstieg in `client/src/App.tsx`
- Farben, Abstände und Schrift als CSS Custom Properties in `client/src/App.css`
- Backend: `server/src/sources/sharepoint.js` für die SharePoint-Anbindung. Den Rest des Backends musst du nicht anpassen.

Viel Erfolg und viel Spass!
