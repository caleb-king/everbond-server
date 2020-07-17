module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL:
    process.env.DB_URL || 'postgresql://everbond:Password@localhost/everbond',
  TEST_DB_URL: 'postgresql://everbond-test:Password@localhost/everbond-test',
  CLIENT_ORIGIN: 'https://everbond.now.sh/',
};
