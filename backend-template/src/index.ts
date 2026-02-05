import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

import { expensesRouter } from './routes/expenses';
import { aiRouter } from './routes/ai';
import { billingRouter } from './routes/billing';
import { webhookRouter } from './routes/webhooks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Stripe webhooks need raw body
app.use('/webhooks', express.raw({ type: 'application/json' }));

// Regular JSON parsing for other routes
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/webhooks', webhookRouter);

// Protected routes
app.use('/api/expenses', ClerkExpressRequireAuth(), expensesRouter);
app.use('/api/ai', ClerkExpressRequireAuth(), aiRouter);
app.use('/api/billing', ClerkExpressRequireAuth(), billingRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
