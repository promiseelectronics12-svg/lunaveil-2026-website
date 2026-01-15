
import { storage, schema } from "./server/provider";

async function checkProvider() {
    console.log("Checking provider...");
    if (storage) {
        console.log("Storage loaded successfully");
    } else {
        console.error("Storage failed to load");
    }

    if (schema) {
        console.log("Schema loaded successfully");
    } else {
        console.error("Schema failed to load");
    }
}

checkProvider().catch(console.error);
