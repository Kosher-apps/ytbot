const DEFAULT_BLACKLIST = ['972501234567', '972540000000'];

function parseBlacklist(rawValue) {
  if (!rawValue) return DEFAULT_BLACKLIST;

  return rawValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const config = {
  authFolder: process.env.AUTH_FOLDER || 'auth_info',
  loggerLevel: process.env.LOG_LEVEL || 'info',
  blacklist: parseBlacklist(process.env.BLACKLIST),
};

module.exports = {
  config,
};
