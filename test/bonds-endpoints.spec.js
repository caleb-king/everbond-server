const knex = require('knex');
const fixtures = require('./bonds-fixtures');
const app = require('../src/app');
const { TEST_DATABASE_URL } = require('../src/config');

describe('Bonds Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => db.raw('TRUNCATE TABLE bonds CASCADE'));

  afterEach('cleanup', () => db.raw('TRUNCATE TABLE bonds CASCADE'));

  describe('GET /bonds', () => {
    context(`Given no bonds`, () => {
      it(`responds with 200 and an empty list`, () =>
        supertest(app)
          .get('/bonds')
          .expect(200, []));
    });

    context('Given there are bonds in the database', () => {
      const testBonds = fixtures.makeBondsArray();

      beforeEach('insert bonds', () => db.into('bonds').insert(testBonds));

      it('gets the bonds from the store', () =>
        supertest(app)
          .get('/bonds')
          .expect(200, testBonds));
    });

    context(`Given an XSS attack bond`, () => {
      const { maliciousBond, expectedBond } = fixtures.makeMaliciousBond();

      beforeEach('insert malicious bond', () =>
        db.into('bonds').insert([maliciousBond])
      );

      it('removes XSS attack content', () =>
        supertest(app)
          .get(`/bonds`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedBond.name);
            expect(res.body[0].notes).to.eql(expectedBond.notes);
          }));
    });
  });

  describe('GET /bonds/:bondId', () => {
    context(`Given no bonds`, () => {
      it(`responds 404 whe bond doesn't exist`, () =>
        supertest(app)
          .get(`/bonds/123`)
          .expect(404, {
            error: { message: `Bond Not Found` },
          }));
    });

    context('Given there are bonds in the database', () => {
      const testBonds = fixtures.makeBondsArray();

      beforeEach('insert bonds', () => db.into('bonds').insert(testBonds));

      it('responds with 200 and the specified bond', () => {
        const bondId = 2;
        const expectedBond = testBonds[bondId - 1];
        return supertest(app)
          .get(`/bonds/${bondId}`)
          .expect(200, expectedBond);
      });
    });
  });

  describe('POST /bonds', () => {
    it(`responds with 400 missing 'name' if not supplied`, () => {
      const newBondMissingName = {
        // name: 'Alyssa',
        birthday: '08/18',
        notes: 'Test note for Alyssa',
      };
      return supertest(app)
        .post(`/bonds`)
        .send(newBondMissingName)
        .expect(400, `'name' is required`);
    });

    it('adds a new bond to the store', () => {
      const newBond = {
        name: 'Kat',
        birthday: '09/10',
        notes: 'Test note for Kat',
      };
      return supertest(app)
        .post(`/bonds`)
        .send(newBond)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newBond.name);
          expect(res.body.birthday).to.eql(newBond.birthday);
          expect(res.body.notes).to.eql(newBond.notes);
          expect(res.body).to.have.property('id');
        })
        .then(res =>
          supertest(app)
            .get(`/bonds/${res.body.id}`)
            .expect(res.body)
        );
    });

    it('removes XSS attack content from response', () => {
      const { maliciousBond, expectedBond } = fixtures.makeMaliciousBond();
      return supertest(app)
        .post(`/bonds`)
        .send(maliciousBond)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(expectedBond.name);
          expect(res.body.notes).to.eql(expectedBond.notes);
        });
    });
  });
});
