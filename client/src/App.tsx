import { useEffect, useState } from 'react';
import { fetchNews } from './api/newsApi';
import type { NewsItem } from './types/news';

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews()
      .then(setNews)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-header__eyebrow">Intranet Gemeinde Musterwil</p>
        <h1>News aus der Verwaltung</h1>
      </header>

      <main className="app-main">
        {loading && <p>News werden geladen …</p>}
        {error && <p role="alert">{error}</p>}

        {/* TODO: Hier kommt deine News-Wall hin. */}
        {!loading && !error && <p className="app-debug">{news.length} News geladen.</p>}
      </main>
    </div>
  );
}
