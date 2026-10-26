import type { NewsItem } from '../types/news';

/** Lädt alle News vom Backend (siehe server/src/index.js). */
export async function fetchNews(): Promise<NewsItem[]> {
  const response = await fetch('/api/news');
  if (!response.ok) {
    throw new Error(`Die News konnten nicht geladen werden (HTTP ${response.status}).`);
  }
  return response.json();
}
