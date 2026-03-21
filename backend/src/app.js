const express = require('express');
const cors    = require('cors');

const authRoutes        = require('./routes/auth.routes');
const patientRoutes     = require('./routes/patients.routes');
const visitRoutes       = require('./routes/visits.routes');
const predictionRoutes  = require('./routes/predictions.routes');
const userRoutes        = require('./routes/users.routes');
const errorHandler      = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',        authRoutes);
app.use('/api/patients',    patientRoutes);
app.use('/api/visits',      visitRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/users',       userRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
