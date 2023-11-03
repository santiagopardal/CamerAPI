const knex = require('./knex')
const { CONNECTION_TABLE } = require('../../constants')


function logStatus(status) {
    return knex(CONNECTION_TABLE).insert(status)
}

module.exports = { logStatus }