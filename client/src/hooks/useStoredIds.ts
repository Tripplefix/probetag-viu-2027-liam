import { useEffect, useState } from 'react';

function loadIds(storageKey: string): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(storageKey) ?? '[]'));
  } catch {
    return new Set();
  }
}

/**
 * Merkt sich eine Menge von News-IDs im localStorage des Browsers (pro Gerät und Browser),
 * z. B. gelesene oder gelikte News. Ist der Speicher blockiert (z. B. privates Fenster),
 * funktioniert die App weiter, der Zustand gilt dann nur bis zum Neuladen.
 */
export function useStoredIds(storageKey: string) {
  const [ids, setIds] = useState(() => loadIds(storageKey));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...ids]));
    } catch {
      // Speicher nicht verfügbar.
    }
  }, [storageKey, ids]);

  function set(id: number, value: boolean) {
    setIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return { has: (id: number) => ids.has(id), set };
}
