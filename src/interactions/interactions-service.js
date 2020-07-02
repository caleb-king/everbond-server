const InteractionsService = {
  getAllInteractions(knex) {
    return knex.select('*').from('interactions');
  },
  getById(knex, id) {
    return knex
      .from('interactions')
      .select('*')
      .where('id', id)
      .first();
  },
  insertInteraction(knex, newInteraction) {
    return knex
      .insert(newInteraction)
      .into('interactions')
      .returning('*')
      .then(rows => rows[0]);
  },
  updateInteraction(knex, id, newInteractionFields) {
    return knex('interactions')
      .where({ id })
      .update(newInteractionFields);
  },
};

module.exports = InteractionsService;
