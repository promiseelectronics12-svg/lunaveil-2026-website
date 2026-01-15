
import fetch from 'node-fetch';

async function testStorefrontSections() {
    const baseUrl = 'http://localhost:5000/api/storefront-sections';

    console.log('1. Creating a new section...');
    const newSection = {
        type: "hero",
        order: 100,
        content: { title: "Test Hero", subtitle: "Test Subtitle" },
        isActive: true
    };

    try {
        const createRes = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSection)
        });

        if (!createRes.ok) {
            console.error('Failed to create section:', await createRes.text());
            return;
        }

        const createdSection = await createRes.json() as any;
        console.log('Created section response:', createdSection);

        console.log('\n2. Fetching sections again to verify persistence...');
        const finalRes = await fetch(baseUrl);
        const finalSections = await finalRes.json() as any[];

        const found = finalSections.find((s: any) => s.id === createdSection.id);
        if (found) {
            console.log('\nSUCCESS: Section found in list!');
            console.log('Content type:', typeof found.content);
            console.log('Content value:', found.content);
        } else {
            console.log('\nFAILURE: Section NOT found in list!');
            console.log('All sections:', JSON.stringify(finalSections, null, 2));
        }

    } catch (e) {
        console.error('Error during test:', e);
    }
}

testStorefrontSections();
