# KI-Logbuch

Kurz und ehrlich, Stichworte reichen. Es gibt keine falschen Antworten.

## Wie hast du mit Claude gearbeitet?

- Ausschliesslich mit Claude Code (Desktop-App). Claude hatte Zugriff auf das Repo, das Terminal und einen Browser, konnte also selbst Server starten, Tests ausführen und die App prüfen.
- Zu Beginn habe ich Claude den Ordner und das Briefing analysieren lassen und daraus einen Tagesplan mit Uhrzeiten erstellt. Nach diesem Plan haben wir Block für Block gearbeitet.
- Ablauf pro Block: Claude setzt um, ich prüfe das Resultat (Code, live im Browser oder in SharePoint) und gebe Feedback. Committet und gepusht wurde erst nach meiner Freigabe.

## Wo hat dir Claude am meisten geholfen?

- Spaltenmodell für die SharePoint-Liste und eine Import-CSV mit korrekter Umrechnung der Zeitzone (Sommer- und Winterzeit)
- SharePoint-Anbindung mit MSAL und Microsoft Graph
- Debugging: Claude hat direkt über Graph herausgefunden, warum die Felder leer waren (interne Spaltennamen `field_1` bis `field_7`, Mehrfachauswahl als Array)
- Sicherheit: HTML aus SharePoint mit DOMPurify bereinigen
- Barrierefreiheit automatisch mit axe-core prüfen, Kontraste nachrechnen

## Wo lag Claude falsch oder hat etwas Unsicheres vorgeschlagen? Wie hast du es gemerkt?

- **Platzhalter `{error}` im `errorTemplate` von MSAL:** Claude hat ihn verwendet, aber MSAL ersetzt ihn nicht, die Fehlerseite hätte wörtlich `{error}` angezeigt. Gemerkt habe ich es beim Durchgehen und Überarbeiten von `sharepoint.js`. Claude hat es danach im MSAL-Quellcode bestätigt.
- **Spaltennamen in SharePoint:** Claude hat angenommen, dass die Namen aus der CSV auch die internen Namen sind. Gemerkt haben wir es beim ersten echten Aufruf: Bis auf den Titel waren alle Felder leer. Claude hat die echten Namen über Graph ausgelesen und das Mapping korrigiert.
- **Erstes Design:** Das Resultat funktionierte, wirkte aber unprofessionell. Die Texte waren abgeschnitten, und die Priorität hatte Claude bewusst auf später verschoben. Gemerkt habe ich es beim Live-Review im Browser. Mit einem konkreten Prompt (drei Punkte, Bezug zum Briefing) habe ich es korrigieren lassen.

## Was hast du bewusst selbst gemacht oder geprüft?

- SharePoint-Liste selbst angelegt, importiert und angepasst (Anzeigename «Priorität», Auswahlwerte)
- `sharepoint.js` selbst überarbeitet: nur bei `InteractionRequiredAuthError` neu anmelden, nur eine fehlende Cache-Datei (`ENOENT`) ignorieren, Browserstart mit `windowsHide` und eigener Fehlerbehandlung
- Live-Review des Designs und Feedback dazu
- Gegenprobe der Tests: `.toLowerCase()` in `filterNews` gelöscht, der Test wurde rot, Änderung zurückgesetzt
- Filter, Suche und Tastaturbedienung im Browser ausprobiert
- Commits und Push jeweils erst nach meiner Freigabe
- Spielregel eingehalten: Claude hat nur Daten aus dem Repo bekommen, keine persönlichen Daten (Teams-Chat und Mails des Probetag-Accounts hat Claude bewusst nicht gelesen)

## Dein bester und dein schlechtester Prompt

- **Bester Prompt:**

  > «Analysiere alles was im Ordner liegt wo du Zugriff hast: C:\Users\liamb\OneDrive\Dokumente\VIU. Du solltest Zugriff haben auf die Microsoft Anwendungen, überprüfe dies. Überprüfe den aktuellen Stand und erstelle einen Plan für mich, welche Aufgaben ich zu welcher Uhrzeit erledigt haben sollte, und du hilfst mir dabei, diese zu erledigen. Merke ihn dir. Ich arbeite mit dir dann nach diesem Plan.»

  Warum gut: Er enthält ein klares Ziel (Plan mit Uhrzeiten), den Kontext (Ordner, Microsoft-Zugriff), einen Prüfauftrag (Stand und Zugriff überprüfen) und legt fest, wie wir zusammenarbeiten. Dadurch hatten wir den ganzen Tag eine gemeinsame Struktur und wussten jederzeit, wo wir im Zeitplan stehen.
  Ebenfalls gut funktioniert hat die Vorgabe «Achte darauf, dass du den Code simpel hältst und nur Nötiges umsetzt». Danach wurde der Code deutlich schlanker.

- **Schlechtester Prompt und was du daraus gelernt hast:**

  > «Ja, Cards bauen»

  Claude hatte einen Plan, und ich habe es kurz vor dem Mittag einfach umsetzen lassen, ohne Vorgaben zu Darstellung, Qualität oder Prioritäten. Claude hat die Aufgabe erledigt, aber nur das Minimum, und das Design wirkte «sloppy». Korrigiert habe ich es mit:

  > «Das Design wirkt sloppy, stelle es professioneller dar. Und was mir auffällt: Die Texte sieht man jeweils nicht vollständig, versuche eine bessere Lösung dafür zu suchen. Und die Priorität wird auch nicht angezeigt. Vergleiche mit der Aufgabenstellung nochmals und nimm Verbesserungen vor.»

  Gelernt: Eine KI liefert nur so gute Resultate, wie sie geführt wird. Sie muss wissen, **was** umgesetzt werden soll, **wie** das Resultat aussehen soll und **woran** es gemessen wird. Und ein kurzes «Ja, mach weiter» ist kein Auftrag.