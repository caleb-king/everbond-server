const knex = require('knex');
const fixtures = require('./interactions-fixtures');
const app = require('../src/app');
const { TEST_DATABASE_URL } = require('../src/config');

describe('Interactions Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup bonds', () => db.raw('TRUNCATE TABLE bonds CASCADE'));

  before('cleanup interactions', () => db('interactions').truncate());

  // add test bonds to satisfy foreign key constraints - bondId
  before('setup bonds', () => {
    const testBonds = fixtures.makeBondsArray();
    return db.into('bonds').insert(testBonds);
  });

  afterEach('cleanup', () => db('interactions').truncate());

  describe('GET /interactions', () => {
    context(`Given no interactions`, () => {
      it(`responds with 200 and an empty list`, () =>
        supertest(app)
          .get('/interactions')
          .expect(200, []));
    });

    context('Given there are interactions in the database', () => {
      const testInteractions = fixtures.makeInteractionsArray();

      beforeEach('insert interactions', () =>
        db.into('interactions').insert(testInteractions)
      );

      it('gets the interactions from the store', () =>
        supertest(app)
          .get('/interactions')
          .expect(200, testInteractions));
    });

    context(`Given an XSS attack interaction`, () => {
      const {
        maliciousInteraction,
        expectedInteraction,
      } = fixtures.makeMaliciousInteraction();

      beforeEach('insert malicious interaction', () =>
        db.into('interactions').insert([maliciousInteraction])
      );

      it('removes XSS attack content', () =>
        supertest(app)
          .get(`/interactions`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].location).to.eql(expectedInteraction.location);
            expect(res.body[0].description).to.eql(
              expectedInteraction.description
            );
          }));
    });
  });

  describe('GET /interactions/:interactionId', () => {
    context(`Given no interactions`, () => {
      it(`responds 404 whe interaction doesn't exist`, () =>
        supertest(app)
          .get(`/interactions/123`)
          .expect(404, {
            error: { message: `Interaction Not Found` },
          }));
    });

    context('Given there are interactions in the database', () => {
      const testInteractions = fixtures.makeInteractionsArray();

      beforeEach('insert interactions', () =>
        db.into('interactions').insert(testInteractions)
      );

      it('responds with 200 and the specified interaction', () => {
        const interactionId = 2;
        // corresponding interaction from test array is 5 el in array
        const expectedInteraction = testInteractions[5];
        return supertest(app)
          .get(`/interactions/${interactionId}`)
          .expect(200, expectedInteraction);
      });
    });
  });

  describe('POST /interactions', () => {
    it(`responds with 400 missing 'bondId' if not supplied`, () => {
      const newInteractionMissingBondId = {
        // bondId: 3,
        date: '2020-07-13',
        medium: 'Phone Call',
        location: '',
        description: 'We had a short chat to catch up.',
      };
      return supertest(app)
        .post(`/interactions`)
        .send(newInteractionMissingBondId)
        .expect(400, `name is required`);
    });

    it(`responds with 400 missing 'date' if not supplied`, () => {
      const newInteractionMissingDate = {
        bondId: 2,
        // date: '2020-07-13',
        medium: 'Phone Call',
        location: '',
        description: 'We had a short chat to catch up.',
      };
      return supertest(app)
        .post(`/interactions`)
        .send(newInteractionMissingDate)
        .expect(400, `'date' is required`);
    });

    it('adds a new interaction to the store', () => {
      const newInteraction = {
        bondId: 2,
        date: '2020-07-13',
        medium: 'Phone Call',
        location: '',
        description: 'We had a short chat to catch up.',
      };
      return supertest(app)
        .post(`/interactions`)
        .send(newInteraction)
        .expect(201)
        .expect(res => {
          expect(res.body.bondId).to.eql(newInteraction.bondId);
          expect(res.body.date).to.eql(newInteraction.date);
          expect(res.body.medium).to.eql(newInteraction.medium);
          expect(res.body.location).to.eql(newInteraction.location);
          expect(res.body.description).to.eql(newInteraction.description);
          expect(res.body).to.have.property('id');
        })
        .then(res =>
          supertest(app)
            .get(`/interactions/${res.body.id}`)
            .expect(res.body)
        );
    });

    it('removes XSS attack content from response', () => {
      const {
        maliciousInteraction,
        expectedInteraction,
      } = fixtures.makeMaliciousInteraction();
      return supertest(app)
        .post(`/interactions`)
        .send(maliciousInteraction)
        .expect(201)
        .expect(res => {
          expect(res.body.location).to.eql(expectedInteraction.location);
          expect(res.body.description).to.eql(expectedInteraction.description);
        });
    });
  });

  describe('DELETE /interactions/:interactionsId', () => {
    it('removes provided bond, responds with 204', () => {
      const interactionId = 2;
      return supertest(app)
        .delete(`/interactions/${interactionId}`)
        .expect(404)
        .then(res =>
          supertest(app)
            .get(`/interactions/${interactionId}`)
            .expect({ error: { message: 'Interaction Not Found' } })
        );
    });
  });
});
