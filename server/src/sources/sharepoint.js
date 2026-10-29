/**
 * Lädt News aus SharePoint und überträgt sie ins API-Format.
 * Setup und Anmeldung: siehe README.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { InteractionRequiredAuthError, PublicClientApplication } from '@azure/msal-node';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const SCOPES = ['https://graph.microsoft.com/Sites.Selected'];
const LIST_NAME = 'News';
const CACHE_FILE = new URL('../../.msal-cache.json', import.meta.url);

// Interne Spaltennamen der Liste. Der CSV-Import hat sie als field_1 … field_7 angelegt,
// die Namen aus der CSV sind nur Anzeigenamen (in Klammern).
const COLUMNS = {
  title: 'Title',
  content: 'field_1', // Inhalt
  category: 'field_2', // Kategorie
  priority: 'field_3', // Prioritaet
  imageUrl: 'field_4', // BildUrl
  imageAlt: 'field_5', // BildAlt
  createdAt: 'field_6', // Publikationsdatum
};

const cachePlugin = {
  async beforeCacheAccess(context) {
    try {
      context.tokenCache.deserialize(await readFile(CACHE_FILE, 'utf-8'));
    } catch (error) {
      // Nur eine fehlende Cachedatei ist erwartet (erste Anmeldung).
      if (error.code !== 'ENOENT') throw error;
    }
  },
  async afterCacheAccess(context) {
    if (context.cacheHasChanged) {
      await writeFile(CACHE_FILE, context.tokenCache.serialize());
    }
  },
};

let msalClient = null;
let pendingLogin = null;
let siteId = null;

function getMsalClient() {
  if (!msalClient) {
    const { AZURE_TENANT_ID, AZURE_CLIENT_ID } = process.env;
    if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID) {
      throw new Error('AZURE_TENANT_ID und AZURE_CLIENT_ID fehlen in server/.env.');
    }
    msalClient = new PublicClientApplication({
      auth: {
        clientId: AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
      },
      cache: { cachePlugin },
    });
  }
  return msalClient;
}

/** Öffnet die Anmeldeseite im Standardbrowser, ohne eine Shell zu verwenden. */
async function openBrowser(url) {
  console.log(`[sharepoint] Bitte im Browser anmelden: ${url}`);
  const [command, args] =
    process.platform === 'win32'
      ? ['rundll32', ['url.dll,FileProtocolHandler', url]]
      : [process.platform === 'darwin' ? 'open' : 'xdg-open', [url]];

  const browser = spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true });
  // Ein fehlgeschlagener Browserstart darf den Server nicht beenden; der Link oben bleibt nutzbar.
  browser.on('error', () => {
    console.error('[sharepoint] Browser konnte nicht geöffnet werden. Bitte den Link oben öffnen.');
  });
  browser.unref();
}

async function getAccessToken() {
  const client = getMsalClient();
  const [account] = await client.getAllAccounts();
  if (account) {
    try {
      const result = await client.acquireTokenSilent({ account, scopes: SCOPES });
      return result.accessToken;
    } catch (error) {
      // Nur wenn eine Anmeldung nötig ist (z. B. Refresh-Token abgelaufen); Netzwerkfehler weitergeben.
      if (!(error instanceof InteractionRequiredAuthError)) throw error;
    }
  }

  // Parallele Requests teilen sich eine Anmeldung.
  pendingLogin ??= client
    .acquireTokenInteractive({
      scopes: SCOPES,
      openBrowser,
      successTemplate: '<p>Anmeldung erfolgreich. Du kannst dieses Fenster schliessen.</p>',
      // MSAL gibt das Template unverändert aus, Platzhalter werden nicht ersetzt.
      errorTemplate: '<p>Anmeldung fehlgeschlagen. Bitte versuche es erneut.</p>',
    })
    .finally(() => {
      pendingLogin = null;
    });
  const result = await pendingLogin;
  return result.accessToken;
}

async function graphGet(pathOrUrl, token) {
  const url = pathOrUrl.startsWith('https://') ? pathOrUrl : `${GRAPH_BASE}${pathOrUrl}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    throw new Error(`Graph-Anfrage fehlgeschlagen (HTTP ${response.status}): ${await response.text()}`);
  }
  return response.json();
}

async function getSiteId(token) {
  if (!siteId) {
    const { hostname, pathname } = new URL(process.env.SHAREPOINT_SITE_URL);
    const site = await graphGet(`/sites/${hostname}:${pathname.replace(/\/$/, '')}`, token);
    siteId = site.id;
  }
  return siteId;
}

/** Auswahlspalten mit Mehrfachauswahl liefern ein Array; die API erwartet einen Einzelwert. */
function firstChoice(value) {
  return Array.isArray(value) ? value[0] : value;
}

/** Überträgt die Spalten ins API-Format und ergänzt Defaults für fehlende Werte. */
export function mapItem(item) {
  const fields = item.fields ?? {};
  return {
    id: Number(item.id),
    title: fields[COLUMNS.title] ?? '',
    content: fields[COLUMNS.content] ?? '',
    category: firstChoice(fields[COLUMNS.category]) ?? '',
    priority: firstChoice(fields[COLUMNS.priority]) ?? null,
    imageUrl: fields[COLUMNS.imageUrl] ?? null,
    imageAlt: fields[COLUMNS.imageAlt] ?? null,
    createdAt: fields[COLUMNS.createdAt] ?? '',
  };
}

export async function loadNews() {
  const token = await getAccessToken();
  const site = await getSiteId(token);

  const items = [];
  let next = `/sites/${site}/lists/${LIST_NAME}/items?$expand=fields($select=${Object.values(COLUMNS).join(',')})&$top=200`;
  while (next) {
    const page = await graphGet(next, token);
    items.push(...page.value);
    next = page['@odata.nextLink'] ?? null;
  }
  return items.map(mapItem);
}
