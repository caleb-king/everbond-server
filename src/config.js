module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://everbond:Password@localhost/everbond',
  TEST_DATABASE_URL:
    'postgresql://everbond-test:Password@localhost/everbond-test',
  CLIENT_ORIGIN: 'https://everbond.now.sh/',
};
