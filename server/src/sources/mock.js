import { readFile } from 'node:fs/promises';

const DATA_FILE = new URL('../../data/news.json', import.meta.url);

/** Liest die Testdaten (Export der SharePoint-Liste «News» der Gemeinde Musterwil). */
export async function loadNews() {
  const raw = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}
