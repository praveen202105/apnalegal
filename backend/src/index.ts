import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';

import authRouter from './routes/auth';
import userRouter from './routes/user';
import documentsRouter from './routes/documents';
import lawyersRouter from './routes/lawyers';
import bookingsRouter from './routes/bookings';
import paymentsRouter from './routes/payments';
import subscriptionsRouter from './routes/subscriptions';
import notificationsRouter from './routes/notifications';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/documents', documentsRouter);
app.use('/lawyers', lawyersRouter);
app.use('/bookings', bookingsRouter);
app.use('/payments', paymentsRouter);
app.use('/subscription', subscriptionsRouter);
app.use('/notifications', notificationsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(
  (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
  }
);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`NyayAI backend running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
