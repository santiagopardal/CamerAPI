
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('node').del()
    .then(function () {
      // Inserts seed entries
      return knex('node').insert([
        {id: 1, ip: '127.0.0.1', port: 5460, last_request: new Date()}
      ]);
    });
};
