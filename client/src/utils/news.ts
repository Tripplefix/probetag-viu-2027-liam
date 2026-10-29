import type { NewsCategory, NewsItem } from '../types/news';

const CATEGORIES: NewsCategory[] = ['Event', 'Projekt', 'Info'];

/** «info» → «Info»; unbekannte oder leere Kategorien (z. B. «Personal») gelten als «Info». */
function normalizeCategory(category: string | null | undefined): NewsCategory {
  const match = CATEGORIES.find((c) => c.toLowerCase() === category?.trim().toLowerCase());
  return match ?? 'Info';
}

/**
 * Bereinigt die Rohdaten aus der API:
 * - Duplikate entfernen (gleiche ID oder gleicher Titel mit gleichem Datum)
 * - Kategorie auf Event, Projekt oder Info vereinheitlichen
 * - Priorität: alles ausser «Hoch» gilt als «Normal»
 */
export function normalizeNews(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items
    .filter((item) => {
      const keys = [`id:${item.id}`, `titel:${item.title}|${item.createdAt}`];
      if (keys.some((key) => seen.has(key))) return false;
      keys.forEach((key) => seen.add(key));
      return true;
    })
    .map((item) => ({
      ...item,
      category: normalizeCategory(item.category),
      priority: item.priority?.toLowerCase() === 'hoch' ? 'Hoch' : 'Normal',
    }));
}
