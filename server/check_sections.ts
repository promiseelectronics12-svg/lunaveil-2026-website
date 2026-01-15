
import { db } from './db.sqlite';
import { storefrontSections } from '@shared/schema.sqlite';
import { eq } from 'drizzle-orm';

async function checkSections() {
    const sections = await db.select().from(storefrontSections);
    const videoSection = sections.find(s => s.type === 'shoppable_video');

    if (videoSection) {
        console.log('Found Shoppable Video Section:');
        console.log(JSON.stringify(videoSection.content, null, 2));
    } else {
        console.log('No Shoppable Video Section found.');
    }
    process.exit(0);
}

checkSections();
