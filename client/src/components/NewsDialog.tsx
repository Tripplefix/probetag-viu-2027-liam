import { useEffect, useId, useRef } from 'react';
import type { NewsItem } from '../types/news';
import { categoryKey, formatDate, highlightHtml, sanitizeHtml } from '../utils/format';
import Highlight from './Highlight';

interface NewsDialogProps {
  news: NewsItem | null;
  read: boolean;
  words: string[];
  onToggleRead: () => void;
  onClose: () => void;
}

/**
 * Zeigt eine News vollständig an. Natives <dialog> mit showModal():
 * Fokus bleibt im Dialog, Esc schliesst, danach springt der Fokus zurück zum Auslöser.
 */
export default function NewsDialog({ news, read, words, onToggleRead, onClose }: NewsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (news && !dialog.open) dialog.showModal();
    if (!news && dialog.open) dialog.close();
  }, [news]);

  const date = news ? formatDate(news.createdAt) : null;
  // Erst markieren, dann bereinigen: DOMPurify ist immer der letzte Schritt vor der Anzeige.
  const content = news ? sanitizeHtml(highlightHtml(news.content, words)) : '';

  return (
    <dialog
      ref={dialogRef}
      className="news-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      // Klick auf den abgedunkelten Hintergrund schliesst den Dialog.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {news && (
        <article className={`news-dialog__inner news-card--${categoryKey(news.category)}`}>
          <button type="button" className="news-dialog__close" onClick={onClose} aria-label="Schliessen">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {news.imageUrl && (
            <img
              // Key: neues Element pro Bild, damit ein ausgeblendetes Fehlerbild nicht hängen bleibt.
              key={news.imageUrl}
              className="news-dialog__image"
              src={news.imageUrl}
              alt={news.imageAlt ?? ''}
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          )}

          <div className={`news-dialog__body${news.imageUrl ? '' : ' news-dialog__body--no-image'}`}>
            <div className="news-card__badges">
              {news.category && <span className="badge badge--category">{news.category}</span>}
              {news.priority === 'Hoch' && <span className="badge badge--important">Wichtig</span>}
            </div>
            <h2 id={titleId} className="news-dialog__title">
              <Highlight text={news.title} words={words} />
            </h2>
            {date && (
              <time className="news-card__date" dateTime={news.createdAt}>
                {date}
              </time>
            )}
            {content ? (
              <div className="news-dialog__content" dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p className="news-dialog__empty">Zu dieser News gibt es keinen weiteren Text.</p>
            )}
            <div className="news-dialog__actions">
              <button type="button" className="button-secondary" onClick={onToggleRead}>
                {read ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
              </button>
            </div>
          </div>
        </article>
      )}
    </dialog>
  );
}
