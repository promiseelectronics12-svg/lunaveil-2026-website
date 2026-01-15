
import { db } from './server/db.sqlite';
import { products } from '@shared/schema.sqlite';
import { like } from 'drizzle-orm';

async function checkProducts() {
    console.log('🔍 Checking products...');

    try {
        const results = await db.select().from(products).where(like(products.nameEn, '%Midnight%'));
        console.log(`Found ${results.length} products matching "Midnight":`);
        results.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.nameEn}, Stock: ${p.stock}`);
        });

        const allProducts = await db.select().from(products);
        console.log(`\nTotal products: ${allProducts.length}`);
    } catch (error) {
        console.error('❌ Error:', error);
    }

    process.exit(0);
}

checkProducts();
