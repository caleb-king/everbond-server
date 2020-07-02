require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const errorHandler = require('./error-handler');
const bondsRouter = require('./bonds/bonds-router');
const interactionsRouter = require('./interactions/interactions-router');

const app = express();

app.use(
  morgan(NODE_ENV === 'production' ? 'tiny' : 'dev', {
    skip: () => NODE_ENV === 'test',
  })
);
app.use(cors());
app.use(helmet());

app.use(bondsRouter);

app.use(interactionsRouter);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use(errorHandler);

module.exports = app;
