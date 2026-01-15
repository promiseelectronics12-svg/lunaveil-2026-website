import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema.sqlite";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create SQLite database file in the project root
const dbPath = path.join(__dirname, '..', 'lunaveil.db');

console.log(`[SQLite] Using database at: ${dbPath}`);

let sqlite;
try {
    console.log("[SQLite] Creating connection...");
    sqlite = new Database(dbPath);
    console.log("[SQLite] Connection created");
} catch (e) {
    console.error("[SQLite] Failed to create connection:", e);
    process.exit(1);
}

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL');
console.log("[SQLite] WAL mode enabled");

// Export the drizzle database instance
export const db = drizzle(sqlite, { schema });
console.log("[SQLite] Drizzle instance created");

// Export the raw sqlite connection for migrations if needed
export { sqlite };
