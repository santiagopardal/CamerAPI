exports.up = function(knex) {
  return knex.schema.createTable('camera', (table) => {
      table.increments('id', {primaryKey: true}).unsigned()
      table.string('name').notNullable()
      table.string('model').notNullable()
      table.string('ip').notNullable()
      table.integer('streaming_port').unsigned()
      table.integer('http_port').unsigned().notNullable()
      table.string('user').notNullable()
      table.string('password').notNullable()
      table.integer('width').notNullable().unsigned()
      table.integer('height').notNullable().unsigned()
      table.integer('framerate').notNullable().unsigned()
      table.integer('node').unsigned().notNullable().references('id').inTable('node')
      table.foreign('node', 'FK_camera_node')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('camera')
};
