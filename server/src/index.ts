import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { query } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ensureMemberStatusConstraint = async () => {
  try {
    await query("ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check");
    await query(
      "ALTER TABLE members ADD CONSTRAINT members_status_check CHECK (status IN ('active', 'expiring', 'expired', 'left', 'pending', 'paused', 'cancelled'))"
    );
  } catch (error) {
    console.error('Migration error:', error);
  }
};

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error');
  res.status(500).json({ error: { message: 'Internal server error' } });
});

ensureMemberStatusConstraint().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
