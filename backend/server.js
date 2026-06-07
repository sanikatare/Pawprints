const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');

const app = express();

if (config.isProduction) {
  app.set('trust proxy', 1);
}

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check (for load balancers / uptime monitors)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/diagnosis', require('./routes/diagnosis'));
app.use('/api/health-history', require('./routes/healthHistory'));
app.use('/api/vaccinations', require('./routes/vaccinations'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/medical-records', require('./routes/medicalRecords'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/search', require('./routes/search'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/weight-logs', require('./routes/weightLogs'));

// Serve React build in production
if (config.isProduction) {
  const buildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(buildPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Global error handler
app.use((err, _req, res, _next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.message });
  }
  if (err.message?.includes('File type')) {
    return res.status(400).json({ message: err.message });
  }
  console.error('[ERROR]', err);
  res.status(500).json({ message: config.isProduction ? 'Internal server error' : err.message });
});

// MongoDB Connection
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const { startReminders } = require('./jobs/reminderScheduler');
    startReminders();
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
    if (config.isProduction) process.exit(1);
  });

const server = app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port} (${config.isProduction ? 'production' : 'development'})`);
});

process.on('SIGTERM', () => {
  server.close(() => mongoose.connection.close(false, () => process.exit(0)));
});
