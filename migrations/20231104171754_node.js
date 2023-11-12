exports.up = function(knex) {
  return knex.schema.createTable('node', (table) => {
      table.increments('id', {primaryKey: true}).unsigned()
      table.string('ip').notNullable()
      table.integer('port').notNullable().unsigned()
      table.datetime('last_request').notNullable()
    })
};

exports.down = function(knex) {
  return knex.schema.dropTable('node')
};