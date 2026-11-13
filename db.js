if (process.env.VERCEL && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be configured for Vercel deployments.');
}

module.exports = process.env.DATABASE_URL
  ? require('./db-postgres')
  : require('./db-json');
