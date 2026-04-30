require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const incidentsRouter = require('./routes/incidents');
const teamsRouter = require('./routes/teams');
const assignmentsRouter = require('./routes/assignments');
const resourcesRouter = require('./routes/resources');
const alertsRouter = require('./routes/alerts');
const profilesRouter = require('./routes/profiles');

const app = express();

// Security & logging
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Manual CORS — handles all origins, preflight, and credentials
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.CORS_ORIGIN || '*';

  if (allowedOrigin === '*') {
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    const allowedList = allowedOrigin.split(',').map(o => o.trim());
    if (origin && allowedList.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ResQNet API', 
    timestamp: new Date().toISOString(),
    cors: process.env.CORS_ORIGIN || '*'
  });
});

// Routes
app.use('/api/incidents', incidentsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/profiles', profilesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚨 ResQNet API running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
});

module.exports = app;