const knex = require('knex')

const knexConnection = knex({
    client: 'sqlite3',
    connection: {
        filename: 'camerai.db'
    }
})

module.exports = knexConnection;