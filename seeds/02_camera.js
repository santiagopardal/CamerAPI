
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('camera').del()
    .then(function () {
      // Inserts seed entries
      return knex('camera').insert([
        {id: 1, name: 'Front Yard', model: 'FI9803PV3', ip: '192.168.0.131', streaming_port: 554, http_port: 80, user: 'admin', password: '*{-4s#aG*_>2', width: 1280, height: 720, framerate: 23, node: 1},
        {id: 2, name: 'Back Yard', model: 'FI9803PV3', ip: '192.168.0.132', streaming_port: 554, http_port: 80, user: 'admin', password: '*{-4s#aG*_>2', width: 1280, height: 720, framerate: 23, node: 1},
        {id: 3, name: 'Back Yard 2', model: 'FI9803PV3', ip: '192.168.0.130', streaming_port: 554, http_port: 80, user: 'admin', password: '*{-4s#aG*_>2', width: 1280, height: 720, framerate: 23, node: 1},
        {id: 4, name: 'Front Yard 2', model: 'FI89182', ip: '192.168.0.133', http_port: 80, user: 'admin', password: '*{-4s#aG*_>2', width: 640, height: 480, framerate: 15, node: 1},
      ]);
    });
};
