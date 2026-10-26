import 'dotenv/config';
import express from 'express';
import { loadNews as loadMockNews } from './sources/mock.js';
import { loadNews as loadSharePointNews } from './sources/sharepoint.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const DATA_SOURCE = (process.env.DATA_SOURCE ?? 'mock').toLowerCase();
const API_DELAY_MS = Number(process.env.API_DELAY_MS ?? 600);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', dataSource: DATA_SOURCE });
});

/**
 * GET /api/news
 * Liefert alle News der Kommunikationsabteilung.
 *
 * Hilfs-Parameter zum Testen:
 *   ?empty=1  liefert eine leere Liste
 *   ?fail=1   simuliert einen Serverfehler (HTTP 500)
 */
app.get('/api/news', async (req, res) => {
  await sleep(API_DELAY_MS);

  if (req.query.fail === '1') {
    return res.status(500).json({ error: 'Simulierter Fehler: SharePoint ist nicht erreichbar.' });
  }
  if (req.query.empty === '1') {
    return res.json([]);
  }

  try {
    const news = DATA_SOURCE === 'sharepoint' ? await loadSharePointNews() : await loadMockNews();
    res.json(news);
  } catch (error) {
    console.error('[api/news]', error);
    res.status(502).json({ error: 'News konnten nicht geladen werden.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend laeuft auf http://localhost:${PORT} (Datenquelle: ${DATA_SOURCE})`);
});
