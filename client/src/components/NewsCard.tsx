import { useId, useState } from 'react';
import type { NewsItem } from '../types/news';
import { categoryKey, excerpt, formatDate, htmlToText } from '../utils/format';
import CategoryIcon from './CategoryIcon';
import HeartButton from './HeartButton';
import Highlight from './Highlight';

interface NewsCardProps {
  news: NewsItem;
  read: boolean;
  liked: boolean;
  onToggleLike: () => void;
  /** Suchwörter, die im Titel und Teaser markiert werden. */
  words: string[];
  onOpen: (news: NewsItem) => void;
}

export default function NewsCard({ news, read, liked, words, onOpen, onToggleLike }: NewsCardProps) {
  const titleId = useId();
  const [imageFailed, setImageFailed] = useState(false);

  const teaser = excerpt(htmlToText(news.content), words);
  const date = formatDate(news.createdAt);
  const category = categoryKey(news.category);
  const important = news.priority === 'Hoch';
  const showImage = Boolean(news.imageUrl) && !imageFailed;

  return (
    <article
      className={`news-card news-card--${category}${important ? ' news-card--important' : ''}${read ? ' news-card--read' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="news-card__media">
        <HeartButton liked={liked} title={news.title} onToggle={onToggleLike} />
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
          {read && <span className="badge badge--read">Gelesen</span>}
        </div>

        <h2 id={titleId} className="news-card__title">
          <Highlight text={news.title} words={words} />
        </h2>

        {teaser && (
          <p className="news-card__teaser">
            <Highlight text={teaser} words={words} />
          </p>
        )}

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
