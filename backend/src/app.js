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
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
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
});

module.exports = app;
