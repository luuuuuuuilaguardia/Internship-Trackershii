import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import https from 'https';
import http from 'http';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import attendanceRoutes from './routes/attendance.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.'
});
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/verify-email', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:3000');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  
  const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
  
  setInterval(() => {
    const protocol = SERVER_URL.startsWith('https') ? https : http;
    const url = `${SERVER_URL}/api/health`;
    
    protocol.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`[${new Date().toISOString()}] Keep-alive ping successful`);
      }
    }).on('error', (err) => {
      console.error(`[${new Date().toISOString()}] Keep-alive ping failed:`, err.message);
    });
  }, 14 * 60 * 1000);
  
  console.log(`Keep-alive: Will ping ${SERVER_URL}/api/health every 14 minutes`);
});