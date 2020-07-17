const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const InteractionsService = require('./interactions-service');

const interactionsRouter = express.Router();
const bodyParser = express.json();

const serializeInteraction = interaction => ({
  id: interaction.id,
  bondId: parseInt(interaction.bondId, 10),
  date: interaction.date,
  medium: interaction.medium,
  location: xss(interaction.location),
  description: xss(interaction.description),
});

interactionsRouter
  .route('/interactions')
  .get((req, res, next) => {
    InteractionsService.getAllInteractions(req.app.get('db'))
      .then(interactions => {
        res.json(interactions.map(serializeInteraction));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { bondId, date, medium, location, description } = req.body;

    if (!bondId) {
      logger.error(`bondId is required`);
      return res.status(400).send(`name is required`);
    }

    if (!date) {
      logger.error(`date is required`);
      return res.status(400).send(`'date' is required`);
    }

    // data validation -> bondId, date

    const newInteraction = { bondId, date, medium, location, description };

    InteractionsService.insertInteraction(req.app.get('db'), newInteraction)
      .then(interaction => {
        logger.info(`Interaction with id ${interaction.id} created.`);
        res.status(201).json(serializeInteraction(interaction));
      })
      .catch(next);
  });

interactionsRouter
  .route('/interactions/:interactionId')
  .all((req, res, next) => {
    const { interactionId } = req.params;
    InteractionsService.getById(req.app.get('db'), interactionId)
      .then(interaction => {
        if (!interaction) {
          logger.error(`Interaction with id ${interactionId} not found.`);
          return res.status(404).json({
            error: { message: `Interaction Not Found` },
          });
        }
        res.interaction = interaction;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeInteraction(res.interaction));
  })
  .patch(bodyParser, (req, res, next) => {
    const { bondId, date, medium, location, description } = req.body;
    const interactionToUpdate = {
      bondId,
      date,
      medium,
      location,
      description,
    };

    if (!bondId) {
      logger.error(`bondId is required`);
      return res.status(400).send(`'name' is required`);
    }

    if (!date) {
      logger.error(`date is required`);
      return res.status(400).send(`'date' is required`);
    }

    // data validation -> bondId, date

    InteractionsService.updateInteraction(
      req.app.get('db'),
      req.params.interactionId,
      interactionToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = interactionsRouter;
