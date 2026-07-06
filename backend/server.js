require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { uploadDir } = require('./middleware/uploadMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(uploadDir));

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }

    // Temporary development fallback: allow API startup without DB for mock login and UI flow testing.
    console.warn('MongoDB unavailable. Starting API in development mode without DB:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`MPBCDC API running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();

module.exports = app;
