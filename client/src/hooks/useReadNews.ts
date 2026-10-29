import { useEffect, useState } from 'react';

const STORAGE_KEY = 'musterwil-news-gelesen';

function loadReadIds(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

/**
 * Merkt sich gelesene News im localStorage des Browsers (pro Gerät und Browser).
 * Ist der Speicher blockiert (z. B. privates Fenster), funktioniert die App ohne Gelesen-Status weiter.
 */
export function useReadNews() {
  const [readIds, setReadIds] = useState(loadReadIds);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds]));
    } catch {
      // Speicher nicht verfügbar: Status gilt nur bis zum Neuladen.
    }
  }, [readIds]);

  function setRead(id: number, read: boolean) {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (read) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return { isRead: (id: number) => readIds.has(id), setRead };
}
