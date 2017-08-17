
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

config.admin = {
  groups: new Set(['self:admin']),
  verifiers: new Set(['self:verifier']),
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
