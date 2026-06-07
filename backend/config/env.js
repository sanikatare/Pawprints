require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

function requireEnv(name, fallback) {
  const value = process.env[name] || fallback;
  if (isProduction && !process.env[name]) {
    console.error(`FATAL: ${name} must be set in production`);
    process.exit(1);
  }
  return value;
}

module.exports = {
  isProduction,
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/pawprints',
  jwtSecret: requireEnv('JWT_SECRET', isProduction ? undefined : 'pawprints_dev_secret_change_me'),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || (isProduction ? false : true),
};
