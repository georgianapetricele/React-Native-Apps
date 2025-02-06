const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./api/apiRoutes');
const logger = require('./config/logger');

const app = express();
app.use(cors());

app.use(bodyParser.json());

app.use('/', apiRoutes);

app.use((req, res) => {
  logger.error(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
