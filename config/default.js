
// static configuration
const config = {};

config.server = {
  hostname: '0.0.0.0',
  port: 8000,
};

config.database = {
  host: 'database',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: () => null,
  ssl: null,
};

config.modules = {
  auth: 'nullauth',
};

config.jwt = {
  secret: () => 'CHANGEME',
  issuer: 'attrbuilder',
  expiration: '2 hour',
  renewInSeconds: 5 * 60,
};

config.admin = {
  groups: new Set([]),
  verifiers: new Set(['everyone']),
};

// load once asked for
function load() {
  return Promise.resolve(config);
}


module.exports = {
  default: config,
  config: config,
  load: load,
};
