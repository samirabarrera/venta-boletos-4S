import pkg from "pg";
export const { Pool } = pkg;
import 'dotenv/config';

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME, 
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
});

export default pool;