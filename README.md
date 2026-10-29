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

1. In `server/.env` setzen: `DATA_SOURCE=sharepoint`, `AZURE_TENANT_ID`, `AZURE_CLIENT_ID` (von der Betreuung).
2. `npm run dev` starten und die App öffnen. Beim ersten Aufruf von `/api/news` öffnet sich der Browser für die Anmeldung mit dem Probetag-Account (MSAL, Public Client, Loopback auf `http://localhost`). Falls kein Browser aufgeht, steht der Link in der Server-Konsole.
3. Der Token-Cache liegt in `server/.msal-cache.json` (gitignored). Danach ist keine erneute Anmeldung nötig, auch nicht nach einem Neustart. Bei Problemen die Datei löschen und neu anmelden.

Die App liest die Liste «News» der Site `SHAREPOINT_SITE_URL`.

## Scripts

| Script | Was es tut |
| --- | --- |
| `npm run install:all` | Installiert Root, Server und Client |
| `npm run dev` | Startet Backend und Frontend parallel |
| `npm test` | Führt die Tests im Client aus (Vitest) |
| `npm run build` | Typecheck und Produktions-Build des Clients |

## Entscheide und Annahmen

### SharePoint-Liste

- Liste «News» per CSV-Import aus `server/data/news.json` erstellt. Die Daten wurden **1:1 übernommen, ohne Bereinigung**: Die App muss mit unsauberen Daten umgehen können, eine stille Korrektur beim Import hätte das Problem nur verdeckt.
- Spalten: `Title`, `Inhalt` (Rich Text, damit Redaktorinnen und Redaktoren einen Editor haben), `Kategorie` und `Prioritaet` (Auswahl), `BildUrl` und `BildAlt` (Text, weil der Typ Hyperlink keine relativen Pfade wie `/images/fondue.svg` akzeptiert), `Publikationsdatum` (Datum, weil «Erstellt» das Importdatum wäre) und `AltId` (ID aus dem alten Tool, zur Nachverfolgung).
- Der CSV-Import hat die internen Spaltennamen als `field_1` … `field_7` angelegt. Die Zuordnung steht in `COLUMNS` in `sharepoint.js`. Die Spalten neu anzulegen hätte mehr Zeit gekostet.
- `Kategorie` und `Prioritaet` sind als Mehrfachauswahl angelegt, Graph liefert deshalb ein Array. Das Backend nimmt den ersten Wert. Empfehlung: in SharePoint auf Einfachauswahl umstellen.

### Backend

- `id` in der API ist die **SharePoint-Item-ID**, weil sie garantiert eindeutig ist. Die alte ID bleibt in `AltId`.
- Das Backend übersetzt nur die Spalten ins API-Format und bereinigt nichts. Die Bereinigung passiert an **einer** Stelle im Frontend (`normalizeNews`) und gilt so für Testdaten und SharePoint gleich.
- Anmeldung nur dann erneut im Browser, wenn MSAL es verlangt (`InteractionRequiredAuthError`). Netzwerkfehler führen nicht zu einer neuen Anmeldung.

### Unsaubere Daten (Annahmen, da der Kunde keine Vorgaben gemacht hat)

| Problem | Umgang |
| --- | --- |
| Doppelte News (ID 102) | Duplikat entfernen, der erste Eintrag zählt. Erkannt an gleicher ID **oder** gleichem Titel mit gleichem Datum (in SharePoint haben Duplikate verschiedene IDs). |
| Kategorie «info» | wird zu «Info» |
| Kategorie «Personal» bzw. unbekannt | wird zu «Info». Laut Kunde gibt es nur Event, Projekt und Info. |
| Priorität fehlt | gilt als «Normal» |
| HTML mit `<script>`, `onerror`, Word-Formatierung | Teaser als reiner Text, voller Inhalt mit DOMPurify bereinigt (siehe Sicherheit) |
| Datum fehlt | «Ohne Datum», am Ende der Liste |
| Bild fehlt oder lädt nicht | Platzhalter in der Kategoriefarbe |
| Alt-Text fehlt | Bild gilt als dekorativ (`alt=""`) |
| Inhalt leer | nur Titel, im Dialog ein Hinweis |
| Sehr lange Wörter | automatische Silbentrennung und Umbruch |

### Sicherheit

- Der Teaser wird mit `DOMParser` in reinen Text umgewandelt. Das so erzeugte Dokument ist inert: Skripte laufen nicht, Bilder werden nicht geladen.
- Der vollständige Inhalt im Dialog wird mit **DOMPurify** bereinigt: keine Skripte und Event-Handler, keine Bilder, keine `style`- und `class`-Attribute. Für Sicherheitscode habe ich bewusst eine bewährte Bibliothek genommen statt einer eigenen Lösung.
- SharePoint hat beim Import `<script>` bereits entfernt. Darauf verlässt sich die App aber nicht, die Testdaten enthalten es weiterhin.

### Darstellung

- Cards im responsiven Raster: so viele Spalten, wie mit mindestens 300px Platz haben, auf Mobile eine.
- Der Teaser ist auf 3 Zeilen gekürzt. Den vollständigen Text zeigt ein Dialog (natives `<dialog>`).
- Der Dialog ist fest am Bildschirm, nicht an der Card. Oben steht eine Aktionsleiste («Gefällt mir», «Gelesen», Schliessen), die beim Scrollen im Dialog stehen bleibt. Die Seite dahinter scrollt nicht mit, solange der Dialog offen ist.
- **Wichtige News** (Priorität «Hoch»): Badge «Wichtig» und farbiger Rahmen, also Farbe **und** Text.
- Sortierung: neueste zuerst.
- Datum in Schweizer Zeit (`Europe/Zurich`), z. B. wird `2026-09-30T22:30Z` zum 1. Oktober.

### Filter und Suche

- Filter nach Kategorie über Buttons mit `aria-pressed`, Suche in Titel und Inhalt (reiner Text, nicht in HTML-Tags).
- Gross- und Kleinschreibung spielt keine Rolle. Bei mehreren Wörtern müssen alle vorkommen.
- Die Logik ist eine reine Funktion (`filterNews` in `client/src/utils/news.ts`) und deshalb einfach testbar.
- Suchtreffer werden in Titel, Teaser und Dialog mit `<mark>` markiert. Liegt der Treffer im Inhalt weiter hinten, beginnt der Teaser kurz davor, damit er sichtbar ist. Im Dialog wird zuerst markiert und danach mit DOMPurify bereinigt, damit die Bereinigung immer der letzte Schritt ist.
- Der Button «Aktualisieren» lädt die News neu, ohne die Seite neu zu laden. Filter und Suche bleiben dabei erhalten.

### «Gelesen» markieren (Kann-Anforderung)

- Wer eine News öffnet, hat sie damit gelesen. Im Dialog lässt sich das über den Umschalter «Gelesen» in der Aktionsleiste rückgängig machen. Gelesene Cards zeigen ein Badge «Gelesen» und treten etwas zurück.
- **Speicherort: `localStorage` im Browser.** Begründung: Die App-Registrierung hat nur delegierte Rechte mit Sites.Selected und keine eigene Datenbank. Ein Status pro Person in SharePoint bräuchte Schreibrechte und eine zusätzliche Liste. `localStorage` braucht kein Backend und speichert keine Personendaten auf dem Server.
- Nachteil: Der Status gilt nur pro Gerät und Browser, er wandert nicht mit der Person. Wenn das gewünscht ist, wäre eine SharePoint-Liste «Gelesen» (Person, News-ID) der nächste Schritt. Ist der Speicher blockiert (z. B. im privaten Fenster), läuft die App ohne Gelesen-Status weiter.

### Like («Gefällt mir»)

- Herz-Button oben links auf jeder Card und «Gefällt mir» in der Aktionsleiste des Dialogs. Nicht gelikt: grau und halbtransparent; gelikt: pink und deckend. Für Screenreader `aria-pressed` und der Name «Gefällt mir: [Titel]».
- Ein Like pro News lässt sich nur ein- und ausschalten, doppelt liken geht nicht. Gespeichert wie «gelesen» im `localStorage` (gemeinsamer Hook `useStoredIds`).
- **Einschränkung:** Gewünscht war «ein Like pro Account». Das ist in dieser Architektur nicht echt umsetzbar: Im Frontend meldet sich niemand an, und das Backend greift mit einem einzigen Account auf SharePoint zu. Die App kennt die Person also nicht. Umgesetzt ist deshalb ein Like pro Browser, ohne Gesamtzahl (eine Zahl wäre ohne zentrale Speicherung irreführend).
- Nächster Schritt für echte Likes pro Account: Anmeldung im Frontend (z. B. MSAL im Browser oder Einbettung als SharePoint-Webpart, das die Person kennt) und eine SharePoint-Liste «Likes» mit Person und News-ID, die doppelte Einträge verhindert.

### Barrierefreiheit

- Semantische Struktur (`header`, `main`, h1 und h2, Liste der Cards, `article`), Buttons mit eindeutigem Namen («Weiterlesen: [Titel]»).
- Trefferanzahl und Ladezustand mit `role="status"`, damit der Screenreader sie ansagt. Fehler mit `role="alert"`.
- Dialog: Fokus bleibt im Dialog, Esc schliesst, danach springt der Fokus zurück zur Card.
- Umschalter («Gefällt mir», «Gelesen», Kategorien) mit `aria-pressed`, damit der Screenreader den Zustand ansagt.
- Fokus-Rahmen als `outline`, damit er auch im Kontrastmodus von Windows sichtbar bleibt. Kontraste mindestens 4.5:1, Animationen aus bei `prefers-reduced-motion`.
- Geprüft mit axe-core (WCAG 2.2 AA: 0 Verstösse) und von Hand mit der Tastatur.

### Tests

- 7 Tests in `client/src/utils/news.test.ts`: Kategorie, Suche in Titel und Inhalt, mehrere Wörter, Kombination von Kategorie und Suche sowie die Datenbereinigung.
- 3 Tests in `client/src/utils/format.test.ts`: Markierung nur im Text (nicht in Tags oder Attributen), Sonderzeichen in der Suche, Teaser rund um einen Treffer.

### Offene Punkte

- Sollen alte «Hoch»-News (z. B. Budget von 2025) weiterhin hervorgehoben werden? Ein Ablaufdatum für die Priorität wäre denkbar.
- Ist «Personal» als vierte Kategorie gewünscht?
- Für die Ticketsystem-News (102) fehlt der Alt-Text, beim Sommerfest (107) die Bilddatei.
- Nicht mit einem echten Screenreader (z. B. NVDA) getestet.
- `npm audit` meldet im Server eine Schwachstelle in `body-parser` (über Express), für den lokalen Betrieb unkritisch.
