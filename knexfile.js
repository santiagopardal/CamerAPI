const env = require('dotenv').config()

const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = env.parsed

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: DB_HOST || 'localhost',
      port: 5432,
      database: 'camerapi',
      user:     'postgres',
      password: 'admin'
    },
    migrations: {
      directory: './migrations'
    },
  },
  staging: {
    client: 'postgresql',
    connection: {
      host:     DB_HOST || 'localhost',
      database: DB_NAME || 'camerapi',
      user:     DB_USER || 'postgres',
      password: DB_PASSWORD || 'admin'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host:     DB_HOST || 'localhost',
      database: DB_NAME || 'camerapi',
      user:     DB_USER || 'postgres',
      password: DB_PASSWORD || 'admin'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations'
    }
  }
};
