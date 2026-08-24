import express from 'express';
import { createApiRouter } from '../server/routes.js';
import { seedDatabase } from '../server/db.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let seeded = false;
app.use(async (req, res, next) => {
  if (!seeded) {
    try {
      await seedDatabase();
      seeded = true;
    } catch (e) {
      console.error('Error seeding DB in serverless handler:', e);
    }
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'TeamFlow API', timestamp: new Date().toISOString() });
});

app.use('/api', createApiRouter());
app.use('/', createApiRouter());

export default app;
