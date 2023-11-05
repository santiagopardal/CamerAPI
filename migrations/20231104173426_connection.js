exports.up = function(knex) {
  return knex.schema.createTable('connection', (table) => {
      table.increments('id', {primaryKey: true})
      table.integer('camera').unsigned().notNullable().references('id').inTable('camera').onDelete('CASCADE')
      table.string('message').notNullable()
      table.datetime('date').notNullable()
      table.foreign('camera', 'FK_camera_camera')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('connection')
};
