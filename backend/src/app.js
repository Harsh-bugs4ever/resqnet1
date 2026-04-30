require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// CORS — fixed to handle multiple origins and env variable correctly
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map(o => o.trim());

    if (allowed.includes('*') || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests for all routes
app.options('*', cors());

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ResQNet API', timestamp: new Date().toISOString() });
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
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

module.exports = app;