import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { seedDatabase } from './server/db.js';
import { createApiRouter } from './server/routes.js';
import { setupSocketIO } from './server/socket.js';

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Initialize DB seed
  await seedDatabase();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });
  setupSocketIO(io);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'TeamFlow API', timestamp: new Date().toISOString() });
  });

  // REST API routes
  app.use('/api', createApiRouter(io));

  // Vite middleware in dev / Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`TeamFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
