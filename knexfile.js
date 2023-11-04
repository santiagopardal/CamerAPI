// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'camerapi',
      user:     'postgres',
      password: 'admin'
    },
    migrations: {
      directory: './migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'camerapi',
      user:     process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'admin'
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
      database: 'camerapi',
      user:     process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'admin'
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
