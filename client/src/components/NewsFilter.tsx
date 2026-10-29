import type { NewsCategory } from '../types/news';
import { CATEGORIES } from '../utils/news';

interface NewsFilterProps {
  category: NewsCategory | null;
  query: string;
  onCategoryChange: (category: NewsCategory | null) => void;
  onQueryChange: (query: string) => void;
}

export default function NewsFilter({ category, query, onCategoryChange, onQueryChange }: NewsFilterProps) {
  const options: { label: string; value: NewsCategory | null }[] = [
    { label: 'Alle', value: null },
    ...CATEGORIES.map((c) => ({ label: c, value: c })),
  ];

  return (
    <div className="news-filter">
      <div className="news-filter__search">
        <label htmlFor="news-search">News durchsuchen</label>
        <input
          id="news-search"
          type="search"
          value={query}
          placeholder="Titel oder Inhalt"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="news-filter__categories" role="group" aria-label="Kategorie">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            className="news-filter__chip"
            aria-pressed={category === option.value}
            onClick={() => onCategoryChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
