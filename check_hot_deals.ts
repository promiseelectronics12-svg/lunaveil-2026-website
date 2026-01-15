
import fetch from 'node-fetch';

async function checkHotDeals() {
    const baseUrl = 'http://localhost:5000/api';

    try {
        // 1. Check Storefront Sections
        console.log('Checking Storefront Sections...');
        const sectionsRes = await fetch(`${baseUrl}/storefront-sections`);
        const sections = await sectionsRes.json() as any[];

        const hotDealsSection = sections.find((s: any) => {
            const content = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
            return content.title === 'Hot Deals' || content.filterType === 'hot';
        });

        if (hotDealsSection) {
            console.log('✅ Found "Hot Deals" section:', hotDealsSection);
        } else {
            console.log('❌ "Hot Deals" section NOT found.');
            console.log('Available sections:', sections.map((s: any) => {
                const content = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
                return { id: s.id, type: s.type, title: content.title, filterType: content.filterType };
            }));
        }

        // 2. Check Products
        console.log('\nChecking Products...');
        const productsRes = await fetch(`${baseUrl}/products?isHot=true`);
        const hotProducts = await productsRes.json() as any[];

        if (hotProducts.length > 0) {
            console.log(`✅ Found ${hotProducts.length} hot products.`);
            hotProducts.forEach((p: any) => console.log(` - ${p.nameEn} (Hot Price: ${p.hotPrice})`));
        } else {
            console.log('❌ No hot products found.');
        }

    } catch (e) {
        console.error('Error during check:', e);
    }
}

checkHotDeals();
