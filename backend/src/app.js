import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import { securityHeaders, requestLogger } from './middleware/security.js';
import { initializeCronJobs } from './services/cronJobs.js';

// Import routes
import authRoutes from './routes/auth.js';
import medicineRoutes from './routes/medicines.js';
import pharmacyRoutes from './routes/pharmacy.js';
import adminRoutes from './routes/admin.js';
import mlRoutes from './routes/ml.js';
import reservationRoutes from './routes/reservations.js';

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Initialize cron jobs
initializeCronJobs();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(securityHeaders);
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { 
    stream: { write: message => logger.info(message.trim()) },
    skip: (req, res) => res.statusCode < 400
  }));
  app.use(requestLogger);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Rural Healthcare Management System API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      medicines: '/api/medicines',
      pharmacy: '/api/pharmacy',
      admin: '/api/admin',
      ml: '/api/ml',
      reservations: '/api/reservations'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/reservations', reservationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
