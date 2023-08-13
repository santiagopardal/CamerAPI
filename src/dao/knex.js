const knex = require('knex')

const knexConnection = knex({
    client: 'sqlite3',
    connection: {
        filename: './APP-Database/camerai.db'
    },
    pool: {
        afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb)
    }
})

module.exports = knexConnection;