import type { NewsItem } from '../types/news';
import { filterNews, normalizeNews } from './news';

function news(overrides: Partial<NewsItem>): NewsItem {
  return {
    id: 1,
    title: 'Titel',
    content: '',
    category: 'Info',
    priority: 'Normal',
    imageUrl: null,
    imageAlt: null,
    createdAt: '2026-10-14T08:15:00Z',
    ...overrides,
  };
}

const fondue = news({ id: 1, title: 'Herbst-Fondue', category: 'Event', content: '<p>Im <strong>Werkhof</strong></p>' });
const ticket = news({ id: 2, title: 'Neues Ticketsystem', category: 'Projekt', content: '<p>Ab 1. November</p>' });
const drucker = news({ id: 3, title: 'Druckerregeln', category: 'Info', content: '<p>Schwarz-weiss drucken</p>' });
const all = [fondue, ticket, drucker];

describe('filterNews', () => {
  it('liefert ohne Kategorie und Suchbegriff alle News', () => {
    expect(filterNews(all, null, '')).toEqual(all);
  });

  it('filtert nach Kategorie', () => {
    expect(filterNews(all, 'Projekt', '')).toEqual([ticket]);
  });

  it('sucht im Titel unabhängig von Gross-/Kleinschreibung', () => {
    expect(filterNews(all, null, 'TICKET')).toEqual([ticket]);
  });

  it('sucht im Inhalt, aber nicht in HTML-Tags', () => {
    expect(filterNews(all, null, 'werkhof')).toEqual([fondue]);
    expect(filterNews(all, null, 'strong')).toEqual([]);
  });

  it('verlangt bei mehreren Wörtern alle Wörter', () => {
    expect(filterNews(all, null, 'drucker schwarz')).toEqual([drucker]);
    expect(filterNews(all, null, 'drucker fondue')).toEqual([]);
  });

  it('kombiniert Kategorie und Suche', () => {
    expect(filterNews(all, 'Event', 'november')).toEqual([]);
    expect(filterNews(all, 'Projekt', 'november')).toEqual([ticket]);
  });
});

describe('normalizeNews', () => {
  it('entfernt Duplikate und vereinheitlicht Kategorie und Priorität', () => {
    const raw = [
      news({ id: 102, title: 'Ticketsystem' }),
      news({ id: 102, title: 'Ticketsystem' }),
      news({ id: 113, title: 'Kantine', category: 'info' as NewsItem['category'], priority: null }),
      news({ id: 104, title: 'Neue Mitarbeitende', category: 'Personal' as NewsItem['category'] }),
    ];

    const result = normalizeNews(raw);

    expect(result.map((n) => n.id)).toEqual([102, 113, 104]);
    expect(result.map((n) => n.category)).toEqual(['Info', 'Info', 'Info']);
    expect(result[1].priority).toBe('Normal');
  });
});
