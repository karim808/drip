import 'dotenv/config';
import express from 'express';
import path from 'path';
import authHandler from './api/auth';
import mapsGroundingHandler from './api/maps-grounding';
import ordersHandler from './api/orders';
import settlementsHandler from './api/settlements';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  // Server-side Authentication & Role-Based Authorization API
  app.all('/api/auth', async (req, res) => {
    try {
      await authHandler(req, res);
    } catch (err) {
      console.error('Auth API error:', err);
      res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
  });

  // Server-side Orders Cloud Persistence API
  app.all('/api/orders', async (req, res) => {
    try {
      await ordersHandler(req, res);
    } catch (err) {
      console.error('Orders API error:', err);
      res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
  });

  // Server-side Financial Settlements Vault API
  app.all('/api/settlements', async (req, res) => {
    try {
      await settlementsHandler(req, res);
    } catch (err) {
      console.error('Settlements API error:', err);
      res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
  });

  // Server-side Gemini 3.8 Flash + Google Maps Grounding API
  app.all('/api/maps-grounding', async (req, res) => {
    try {
      await mapsGroundingHandler(req, res);
    } catch (err) {
      console.error('Maps Grounding API error:', err);
      res.status(500).json({ ok: false, error: 'Internal Server Error' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FAST DRIP server running on http://localhost:${PORT}`);
  });
}

startServer();
