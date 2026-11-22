import {env} from 'process';
import { Pool } from 'pg';

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  password: env.DB_PASSWORD,
  port: Number(env.DB_PORT),
  database: env.DB_NAME

})

export default pool;