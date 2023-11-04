exports.up = function(knex) {
  return knex.schema.createTable('cameraConfigurations', (table) => {
      table.integer('camera').unsigned().notNullable().references('id').inTable('camera')
      table.boolean('recording').notNullable()
      table.float('sensitivity').notNullable()
      table.foreign('camera', 'FK_camera_camera')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('cameraConfigurations')
};
