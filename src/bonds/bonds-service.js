const BondsService = {
  getAllBonds(knex) {
    return knex.select('*').from('bonds');
  },
  getById(knex, id) {
    return knex
      .from('bonds')
      .select('*')
      .where('id', id)
      .first();
  },
  insertBond(knex, newBond) {
    return knex
      .insert(newBond)
      .into('bonds')
      .returning('*')
      .then(rows => rows[0]);
  },
  updateBond(knex, id, newBondFields) {
    return knex('bonds')
      .where({ id })
      .update(newBondFields);
  },
};

module.exports = BondsService;
