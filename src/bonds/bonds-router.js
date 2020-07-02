const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const BondsService = require('./bonds-service');

const bondsRouter = express.Router();
const bodyParser = express.json();

const serializeBond = bond => ({
  id: bond.id,
  name: xss(bond.name),
  birthday: bond.birthday,
  notes: xss(bond.notes),
});

bondsRouter
  .route('/bonds')
  .get((req, res, next) => {
    BondsService.getAllBonds(req.app.get('db'))
      .then(bonds => {
        res.json(bonds.map(serializeBond));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { name, birthday, notes } = req.body;

    if (!name) {
      logger.error(`name is required`);
      return res.status(400).send(`'name' is required`);
    }

    // data validation -> birthday

    const newBond = { name, birthday, notes };

    BondsService.insertBond(req.app.get('db'), newBond)
      .then(bond => {
        logger.info(`Bond with id ${bond.id} created.`);
        res.status(201).json(serializeBond(bond));
      })
      .catch(next);
  });

bondsRouter
  .route('/bonds/:bondId')
  .all((req, res, next) => {
    const { bondId } = req.params;
    BondsService.getById(req.app.get('db'), bondId)
      .then(bond => {
        if (!bond) {
          logger.error(`Bond with id ${bondId} not found.`);
          return res.status(404).json({
            error: { message: `Bond Not Found` },
          });
        }
        res.bond = bond;
        next();
      })
      .catch(next);
  })
  .get((req, res) => {
    res.json(serializeBond(res.bond));
  })
  .patch(bodyParser, (req, res, next) => {
    const { name, birthday, notes } = req.body;
    const bondToUpdate = { name, birthday, notes };

    if (!name) {
      logger.error(`name is required`);
      return res.status(400).send(`'name' is required`);
    }

    // data validation -> birthday

    BondsService.updateBond(req.app.get('db'), req.params.bondId, bondToUpdate)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bondsRouter;
