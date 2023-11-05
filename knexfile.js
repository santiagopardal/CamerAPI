module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
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
      host:     process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'camerapi',
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
      host:     process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'camerapi',
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
