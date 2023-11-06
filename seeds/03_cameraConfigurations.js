
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('cameraConfigurations').del()
    .then(function () {
      // Inserts seed entries
      return knex('cameraConfigurations').insert([
        {camera: 1, recording: false, sensitivity: 0.5},
        {camera: 2, recording: false, sensitivity: 0.5},
        {camera: 3, recording: false, sensitivity: 0.5},
        {camera: 4, recording: false, sensitivity: 0.5}
      ]);
    });
};
