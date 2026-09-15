export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
  auth: {
    jwt_secret: process.env.JWT_SECRET,
    refresh_token_secret: process.env.REFRESH_TOKEN,
    jwt_expires_in: process.env.JWT_EXPIRES_IN || '1h',
  },
});
