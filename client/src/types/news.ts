/** Kategorien laut Kommunikationsabteilung der Gemeinde Musterwil. */
export type NewsCategory = 'Event' | 'Projekt' | 'Info';

/** Priorität aus der SharePoint-Spalte «Prioritaet». */
export type NewsPriority = 'Hoch' | 'Normal';

/** Ein Eintrag aus GET /api/news. */
export interface NewsItem {
  id: number;
  title: string;
  /** Rich Text aus SharePoint, kann HTML enthalten. */
  content: string;
  category: NewsCategory;
  priority: NewsPriority | null;
  imageUrl: string | null;
  imageAlt: string | null;
  /** ISO 8601 (UTC). */
  createdAt: string;
}
