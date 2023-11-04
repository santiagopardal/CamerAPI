const knex = require('knex')
const options = require('../../../knexfile')
const knexConnection = knex(options[process.env.NODE_ENV ?? 'development'])

module.exports = knexConnection;