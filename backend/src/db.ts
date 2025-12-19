import postgres from 'postgres';
import 'dotenv/config';

export const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });