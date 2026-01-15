
import { db } from './db.sqlite';
import { products } from '@shared/schema.sqlite';

async function resetProducts() {
    console.log('🗑️ Deleting all products...');
    await db.delete(products);
    console.log('✅ Products deleted.');
    process.exit(0);
}

resetProducts();
