import { useEffect, useState } from 'react';
import { fetchNews } from './api/newsApi';
import NewsCard from './components/NewsCard';
import NewsDialog from './components/NewsDialog';
import type { NewsItem } from './types/news';
import { sortNewestFirst } from './utils/format';
import { normalizeNews } from './utils/news';

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NewsItem | null>(null);

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
          <ul className="news-grid">
            {news.map((item) => (
              <li key={item.id}>
                <NewsCard news={item} onOpen={setSelected} />
              </li>
            ))}
          </ul>
        )}
      </main>

      <NewsDialog news={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
