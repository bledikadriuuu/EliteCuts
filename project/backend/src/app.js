import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import servicesRoutes from './routes/services.js';
import restAppointmentsRoutes from './routes/appointments.js';
import authRoutes from './routes/auth.js';
import apiAppointmentsRoutes from './routes/apiAppointments.js';
import apiServicesRoutes from './routes/apiServices.js';
import availabilityRoutes from './routes/availability.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/auth.js';
import { me } from './controllers/authController.js';

dotenv.config();

const app = express();

const originList = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (originList.includes('*')) {
        callback(null, true);
        return;
      }
      if (!requestOrigin || originList.includes(requestOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/rest/v1/services', servicesRoutes);
app.use('/rest/v1/appointments', restAppointmentsRoutes);

app.use('/api/auth', authRoutes);
app.get('/api/me', requireAuth, me);
app.use('/api/appointments', apiAppointmentsRoutes);
app.use('/api/services', apiServicesRoutes);
app.use('/api/availability', availabilityRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
