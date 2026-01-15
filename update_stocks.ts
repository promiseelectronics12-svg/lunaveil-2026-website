// Update all product stocks to 50
import { db } from './server/db.sqlite';
import { products } from '@shared/schema.sqlite';

async function updateStocks() {
    console.log('📦 Updating all product stocks to 50...');

    try {
        const result = await db.update(products).set({ stock: 50 });
        console.log('✅ All products updated to stock: 50');

        // Show current products
        const allProducts = await db.select().from(products);
        console.log(`\n📋 Total products in database: ${allProducts.length}`);
        allProducts.forEach(p => {
            console.log(`   - ${p.nameEn}: Stock ${p.stock}`);
        });
    } catch (error) {
        console.error('❌ Error:', error);
    }

    process.exit(0);
}

updateStocks();
