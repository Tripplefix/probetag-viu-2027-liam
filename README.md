# Probetag viu 2027: News-Wall Musterwil

Starter-Kit für den Probetag im IMS-Praktikum bei viu. Die Aufgabe steht in [BRIEFING.md](BRIEFING.md).

## Architektur

```
React-Frontend (Vite, Port 5173)
  -> Vite-Dev-Proxy (/api)
  -> Express-Backend (Port 3001)
  -> Datenquelle: Testdaten (server/data/news.json) oder SharePoint-Liste via Microsoft Graph
```

## Setup

Voraussetzung: Node.js 22.12 oder neuer.

```bash
npm run install:all
npm run dev
```

Ohne weitere Konfiguration liest das Backend die Testdaten aus `server/data/news.json`.

### SharePoint als Datenquelle

Die Anbindung an SharePoint ist Teil der Aufgabe, siehe [BRIEFING.md](BRIEFING.md). Kopiere `server/.env.example` nach `server/.env` und setze `DATA_SOURCE=sharepoint`, sobald deine Anbindung in `server/src/sources/sharepoint.js` steht.

## Scripts

| Script | Was es tut |
| --- | --- |
| `npm run install:all` | Installiert Root, Server und Client |
| `npm run dev` | Startet Backend und Frontend parallel |
| `npm test` | Führt die Tests im Client aus (Vitest) |
| `npm run build` | Typecheck und Produktions-Build des Clients |

## Entscheide und Annahmen

_Hier dokumentierst du deine wichtigsten Entscheide, Annahmen und offenen Punkte._
