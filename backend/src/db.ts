import postgres from 'postgres';
import 'dotenv/config';

//export const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export const sql = postgres(process.env.DATABASE_URL!);

 // Al final del archivo, temporalmente:
  sql`SELECT NOW()`.then(result => {
    console.log('✓ DB conectada:', result[0].now);
    // process.exit(0);
  }).catch(err => {
    console.error('✗ Falló la conexión:', err.message);
    process.exit(1);
  });