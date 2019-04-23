// static configuration
const config = {};

config.server = {
  hostname: '0.0.0.0',
  port: 8000,
  maxRequestSize: '100kb',

  /**
   * Set to a header value to use a content security policy, or set to
   * `false` to disable entirely.
   */
  contentSecurityPolicy: "script-src 'self'",

  /**
   * Enable/disable CORS support.
   *
   * false - no CORS support
   * true - equivalent to '*' -- use only in development
   * a string - set a static allowed origin
   */
  cors: false,
};

config.database = {
  host: 'database',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: () => undefined,
  ssl: undefined,
};

config.modules = {
  auth: 'nullauth',
};

config.admin = {
  groups: new Set(['self:admin']),
  verifiers: new Set(['self:verifier']),
};

config.globalACL = {
  'self:viewer': 'viewer',
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
