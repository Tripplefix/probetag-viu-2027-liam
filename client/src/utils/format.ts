import DOMPurify from 'dompurify';
import type { NewsItem } from '../types/news';

/**
 * Wandelt Rich Text (HTML) in reinen Text für den Teaser um.
 * DOMParser erzeugt ein inertes Dokument: Skripte laufen nicht, Bilder werden nicht geladen.
 */
export function htmlToText(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style').forEach((el) => el.remove());
  // Leerzeichen nach Blockelementen, damit Absätze nicht zusammenkleben.
  doc.querySelectorAll('p, li, br, div, h1, h2, h3, h4, h5, h6').forEach((el) => el.after(' '));
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Bereinigt Rich Text für die Anzeige des vollständigen Inhalts.
 * Entfernt Skripte, Event-Handler und Bilder sowie Word-/SharePoint-Formatierungen
 * (style, class), damit der Text im Design der App erscheint.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ['img', 'style'],
    FORBID_ATTR: ['style', 'class'],
  });
}

/** Regex, die alle Suchwörter findet (ohne Gross-/Kleinschreibung); null ohne Suchwörter. */
export function highlightPattern(words: string[]): RegExp | null {
  if (words.length === 0) return null;
  const escaped = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(${escaped.join('|')})`, 'gi');
}

/**
 * Markiert Suchwörter im Rich Text mit <mark>, nur in Textknoten (nie in Tags oder Attributen).
 * Das Resultat muss danach noch mit sanitizeHtml bereinigt werden.
 */
export function highlightHtml(html: string, words: string[]): string {
  const pattern = highlightPattern(words);
  if (!html || !pattern) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  for (const node of textNodes) {
    const parts = node.data.split(pattern);
    if (parts.length === 1) continue;
    node.replaceWith(
      ...parts.map((part, i) => {
        if (i % 2 === 0) return part;
        const mark = doc.createElement('mark');
        mark.textContent = part;
        return mark;
      }),
    );
  }
  return doc.body.innerHTML;
}

/** Liegt der erste Treffer weiter hinten, beginnt der Teaser kurz davor, damit er sichtbar ist. */
export function excerpt(text: string, words: string[], visibleChars = 120): string {
  const lower = text.toLowerCase();
  const first = Math.min(...words.map((word) => lower.indexOf(word)).filter((i) => i >= 0));
  if (!Number.isFinite(first) || first < visibleChars) return text;
  const start = text.lastIndexOf(' ', first - 30) + 1;
  return `… ${text.slice(start)}`;
}

const KNOWN_CATEGORIES = ['event', 'projekt', 'info'];

/** CSS-Modifier für die Kategorie; unbekannte Werte (z. B. «Personal») erhalten einen neutralen Stil. */
export function categoryKey(category: string): string {
  const key = category?.toLowerCase() ?? '';
  return KNOWN_CATEGORIES.includes(key) ? key : 'other';
}

const dateFormat = new Intl.DateTimeFormat('de-CH', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Zurich',
});

function toTime(iso: string): number | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? null : time;
}

/** Formatiert ein ISO-Datum (UTC) in Schweizer Zeit, z. B. «14. Oktober 2026». Ungültig oder leer: null. */
export function formatDate(iso: string): string | null {
  const time = toTime(iso);
  return time === null ? null : dateFormat.format(time);
}

/** Neueste zuerst; News ohne gültiges Datum ans Ende. */
export function sortNewestFirst(news: NewsItem[]): NewsItem[] {
  return [...news].sort((a, b) => (toTime(b.createdAt) ?? -Infinity) - (toTime(a.createdAt) ?? -Infinity));
}
