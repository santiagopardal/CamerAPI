exports.up = function(knex) {
  return knex.schema.createTable('video', (table) => {
      table.increments('id', {primaryKey: true}).unsigned()
      table.string('path').notNullable()
      table.date('date').notNullable()
      table.integer('camera').unsigned().notNullable().references('id').inTable('camera').onDelete('CASCADE')
      table.integer('node').unsigned().notNullable().references('id').inTable('node').onDelete('CASCADE')
      table.boolean('is_temporal').notNullable().defaultTo(true)
      table.boolean('is_in_node').notNullable()
      table.foreign('camera', 'FK_camera_camera')
      table.foreign('node', 'FK_node_node')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('video')
};
