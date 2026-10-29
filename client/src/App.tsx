import { useEffect, useState } from 'react';
import { fetchNews } from './api/newsApi';
import NewsCard from './components/NewsCard';
import NewsDialog from './components/NewsDialog';
import NewsFilter from './components/NewsFilter';
import type { NewsCategory, NewsItem } from './types/news';
import { sortNewestFirst } from './utils/format';
import { filterNews, normalizeNews } from './utils/news';

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [category, setCategory] = useState<NewsCategory | null>(null);
  const [query, setQuery] = useState('');

  const visible = filterNews(news, category, query);

  useEffect(() => {
    fetchNews()
      .then((items) => setNews(sortNewestFirst(normalizeNews(items))))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <p className="app-header__eyebrow">Intranet Gemeinde Musterwil</p>
          <h1>News aus der Verwaltung</h1>
        </div>
      </header>

      <main className="app-main">
        {loading && <p className="app-status">News werden geladen …</p>}
        {error && (
          <p className="app-status app-status--error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && news.length === 0 && <p className="app-status">Zurzeit gibt es keine News.</p>}
        {!loading && !error && news.length > 0 && (
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
                    <NewsCard news={item} onOpen={setSelected} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      <NewsDialog news={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
