import {env} from 'process';
import { Pool } from 'pg';

/*export const poolLocal = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  password: env.DB_PASSWORD,
  port: Number(env.DB_PORT),
  database: env.DB_NAME

})*/  

const pool = new Pool ({
  connectionString: env.DB_NEON_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export default pool;