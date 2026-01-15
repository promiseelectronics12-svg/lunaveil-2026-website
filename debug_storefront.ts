
import { db } from "./server/db";
import { storefrontSections } from "@shared/schema";

async function main() {
    const sections = await db.select().from(storefrontSections);
    console.log(JSON.stringify(sections, null, 2));
}

main().catch(console.error);
