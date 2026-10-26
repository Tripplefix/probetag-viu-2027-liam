/**
 * Datenquelle SharePoint (aktiv mit DATA_SOURCE=sharepoint in server/.env).
 *
 * TODO: Diese Anbindung baust du selbst.
 *
 * Vertrag: loadNews() liefert ein Array im selben Format wie die Testdaten
 * (siehe server/data/news.json und client/src/types/news.ts), damit das
 * Frontend nicht merkt, woher die Daten kommen.
 *
 * Gegeben:
 * - Site: https://viuteam.sharepoint.com/sites/viu-probetag-2027
 * - Eine App-Registrierung in Entra ID: Public Client, delegierte Berechtigung
 *   Sites.Selected, Redirect-URI http://localhost, kein Secret. Tenant-ID und
 *   Client-ID erhältst du von der Betreuung. Die App greift mit den Rechten
 *   deines Probetag-Accounts zu und nur auf diese eine Site.
 * - Das Paket @azure/msal-node ist bereits installiert.
 */
export async function loadNews() {
  throw new Error('Die SharePoint-Anbindung ist noch nicht implementiert (server/src/sources/sharepoint.js).');
}
