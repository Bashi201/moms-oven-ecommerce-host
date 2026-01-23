// index.js (updated for production CORS)
//require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const cakeRoutes = require('./routes/cakes');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',  // Keep for local development
    'https://helpful-learning-production-55f4.up.railway.app'  // Production frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  // If using cookies/auth, else false
}));
app.use(express.json());

// Serve static files (uploaded cake images)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cakes', cakeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send(
    "Mom's Oven Backend is running! ✓<br>" +
    "Try:<br>" +
    "- POST /api/auth/register<br>" +
    "- POST /api/auth/login<br>" +
    "- GET /api/auth/me (with Bearer token)<br>" +
    "- POST /api/cakes (with form-data & images)<br>" +
    "Images served at: http://localhost:5000/uploads/..."
  );
});

// Global error handler (prevents server crash on upload/form errors)
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack || err);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  
  res.status(500).json({ 
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Prevent full process crash on unexpected errors
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION (server stays alive):', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const PORT = process.env.PORT || 5000;

initializeDatabase((err, connection) => {
  if (err) {
    console.error('Database initialization failed!');
    console.error(err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`=====================================`);
    console.log(`Mom's Oven Backend is LIVE!`);
    console.log(`Port: ${PORT}`);
    console.log(`Test: http://localhost:${PORT}/`);
    console.log(`Register: POST http://localhost:${PORT}/api/auth/register`);
    console.log(`Login:    POST http://localhost:${PORT}/api/auth/login`);
    console.log(`Cakes:    POST http://localhost:${PORT}/api/cakes (with images)`);
    console.log(`Uploads:  http://localhost:${PORT}/uploads/...`);
    console.log(`=====================================`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    if (connection) connection.end();
    console.log('\nServer stopped gracefully.');
    process.exit(0);
  });
});