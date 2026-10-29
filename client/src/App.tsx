import { useCallback, useEffect, useState } from 'react';
import { fetchNews } from './api/newsApi';
import NewsCard from './components/NewsCard';
import NewsDialog from './components/NewsDialog';
import NewsFilter from './components/NewsFilter';
import { useStoredIds } from './hooks/useStoredIds';
import type { NewsCategory, NewsItem } from './types/news';
import { sortNewestFirst } from './utils/format';
import { filterNews, normalizeNews, searchWords } from './utils/news';

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [category, setCategory] = useState<NewsCategory | null>(null);
  const [query, setQuery] = useState('');
  const read = useStoredIds('musterwil-news-gelesen');
  const liked = useStoredIds('musterwil-news-likes');

  const visible = filterNews(news, category, query);
  const words = searchWords(query);

  // Lädt die News neu, ohne Filter und Suche zurückzusetzen.
  const loadNews = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchNews()
      .then((items) => setNews(sortNewestFirst(normalizeNews(items))))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  function openNews(item: NewsItem) {
    setSelected(item);
    read.set(item.id, true);
  }

  function toggleLike(id: number) {
    liked.set(id, !liked.has(id));
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div>
            <p className="app-header__eyebrow">Intranet Gemeinde Musterwil</p>
            <h1>News aus der Verwaltung</h1>
          </div>
          <button
            type="button"
            className="app-header__refresh"
            // aria-disabled statt disabled, damit der Fokus beim Laden auf dem Button bleibt.
            aria-disabled={loading}
            onClick={() => !loading && loadNews()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {loading ? 'Wird aktualisiert …' : 'Aktualisieren'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {loading && news.length === 0 && (
          <p className="app-status" role="status">
            News werden geladen …
          </p>
        )}
        {error && (
          <p className="app-status app-status--error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && news.length === 0 && <p className="app-status">Zurzeit gibt es keine News.</p>}
        {news.length > 0 && (
          <>
            <NewsFilter
              category={category}
              query={query}
              onCategoryChange={setCategory}
              onQueryChange={setQuery}
            />
            <p className="news-count" role="status">
              {visible.length === news.length
                ? `${news.length} News`
                : `${visible.length} von ${news.length} News`}
            </p>
            {visible.length === 0 ? (
              <p className="app-status">Keine News gefunden. Passe die Suche oder die Kategorie an.</p>
            ) : (
              <ul className="news-grid">
                {visible.map((item) => (
                  <li key={item.id}>
                    <NewsCard
                      news={item}
                      read={read.has(item.id)}
                      liked={liked.has(item.id)}
                      words={words}
                      onOpen={openNews}
                      onToggleLike={() => toggleLike(item.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      <NewsDialog
        news={selected}
        read={selected ? read.has(selected.id) : false}
        liked={selected ? liked.has(selected.id) : false}
        words={words}
        onToggleRead={() => selected && read.set(selected.id, !read.has(selected.id))}
        onToggleLike={() => selected && toggleLike(selected.id)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
