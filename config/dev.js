const base = require('./default');

const config = base.config;

config.server = {
  hostname: '0.0.0.0',
  port: 2424,
  contentSecurityPolicy: false,
  cors: true,
};

config.database = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: () => 'oss-attribution-builder-postgres',
  ssl: null,
};

module.exports = {
  default: config,
  config: config,
  load: base.load,
};
