import { useId, useState } from 'react';
import type { NewsItem } from '../types/news';
import { categoryKey, formatDate, htmlToText } from '../utils/format';
import CategoryIcon from './CategoryIcon';

interface NewsCardProps {
  news: NewsItem;
  onOpen: (news: NewsItem) => void;
}

export default function NewsCard({ news, onOpen }: NewsCardProps) {
  const titleId = useId();
  const [imageFailed, setImageFailed] = useState(false);

  const teaser = htmlToText(news.content);
  const date = formatDate(news.createdAt);
  const category = categoryKey(news.category);
  const important = news.priority === 'Hoch';
  const showImage = Boolean(news.imageUrl) && !imageFailed;

  return (
    <article
      className={`news-card news-card--${category}${important ? ' news-card--important' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="news-card__media">
        {showImage ? (
          <img
            src={news.imageUrl!}
            // Ohne Beschreibung gilt das Bild als dekorativ und wird vom Screenreader übersprungen.
            alt={news.imageAlt ?? ''}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="news-card__placeholder">
            <CategoryIcon category={category} />
          </div>
        )}
      </div>

      <div className="news-card__body">
        <div className="news-card__badges">
          {news.category && <span className="badge badge--category">{news.category}</span>}
          {important && <span className="badge badge--important">Wichtig</span>}
        </div>

        <h2 id={titleId} className="news-card__title">
          {news.title}
        </h2>

        {teaser && <p className="news-card__teaser">{teaser}</p>}

        <div className="news-card__footer">
          {date ? (
            <time className="news-card__date" dateTime={news.createdAt}>
              {date}
            </time>
          ) : (
            <span className="news-card__date">Ohne Datum</span>
          )}
          <button type="button" className="news-card__more" onClick={() => onOpen(news)}>
            Weiterlesen<span className="visually-hidden">: {news.title}</span>
            <span className="news-card__arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
