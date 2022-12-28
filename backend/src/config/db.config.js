import * as dotenv from 'dotenv';
dotenv.config();

export default {
  HOST: process.env.DB_HOST || '127.0.0.1',
  USER: process.env.DB_USER || 'sop_admin',
  PASSWORD: process.env.DB_PASSWORD || 'sop123!',
  DB: process.env.DB_NAME || 'sop_database',
  PORT: process.env.DB_PORT || 3306,
};
