import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import type { IStorage } from "./interface";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine which database to use
const USE_SQLITE = process.env.USE_SQLITE === 'true';
console.log(`[Provider] Database Mode: ${USE_SQLITE ? 'SQLite' : 'PostgreSQL'}`);

// We need to export a holder object that will be populated asynchronously
// This allows other modules to import 'storage' and 'schema' immediately,
// even though they might not be initialized yet.
// However, since top-level await is supported in ESM, we can export the initialized values directly if we use top-level await.

let storage: IStorage;
let schema: any;

try {
    if (USE_SQLITE) {
        // SQLite Mode
        const schemaPath = path.resolve(__dirname, "../shared/schema.sqlite.ts");
        console.log(`[Provider] Importing schema from: ${schemaPath}`);
        schema = await import(pathToFileURL(schemaPath).href);

        const storagePath = path.resolve(__dirname, "./storage.sqlite.ts");
        console.log(`[Provider] Importing storage from: ${storagePath}`);
        const storageModule = await import(pathToFileURL(storagePath).href);
        storage = storageModule.storage;
    } else {
        // PostgreSQL Mode (Default)
        console.log(`[Provider] Importing standard schema`);
        schema = await import("@shared/schema");

        console.log(`[Provider] Importing standard storage`);
        const storageModule = await import("./storage");
        storage = storageModule.storage;
    }
    console.log(`[Provider] Initialization successful`);
} catch (e) {
    console.error(`[Provider] Failed to initialize storage provider:`, e);
    process.exit(1);
}

export { storage, schema };
