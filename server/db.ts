// Database connection with SQLite/PostgreSQL switch
// Set USE_SQLITE=true environment variable to use SQLite

const USE_SQLITE = process.env.USE_SQLITE === 'true';

let db: any;
let pool: any;

if (USE_SQLITE) {
  // Dynamic import for SQLite
  console.log('[Database] Using SQLite mode');
  const { db: sqliteDb } = await import('./db.sqlite');
  db = sqliteDb;
  pool = null; // SQLite doesn't use a pool
} else {
  // PostgreSQL mode (original)
  console.log('[Database] Using PostgreSQL mode');
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const ws = (await import('ws')).default;
  const schema = await import('@shared/schema');

  neonConfig.webSocketConstructor = ws;

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { db, pool };
