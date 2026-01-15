
import fetch from 'node-fetch';

async function fixHotDeals() {
    const baseUrl = 'http://localhost:5000/api';

    try {
        // 1. Fetch existing products to mark some as hot
        console.log('Fetching products...');
        const productsRes = await fetch(`${baseUrl}/products`);
        const products = await productsRes.json();
        console.log('Products response type:', typeof products);
        if (!Array.isArray(products)) {
            console.error('Products response is not an array:', products);
            return;
        }

        if (products.length === 0) {
            console.log('❌ No products found to mark as hot.');
            return;
        }

        // Mark the first 2 products as hot
        const productsToUpdate = products.slice(0, 2);
        console.log(`Marking ${productsToUpdate.length} products as hot...`);

        for (const product of productsToUpdate) {
            const regularPrice = parseFloat(product.price);
            const hotPrice = (regularPrice * 0.8).toFixed(0); // 20% off

            const updateRes = await fetch(`${baseUrl}/products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isHot: true,
                    hotPrice: hotPrice.toString()
                })
            });

            if (updateRes.ok) {
                console.log(`✅ Marked "${product.nameEn}" as hot (Price: ${regularPrice} -> ${hotPrice})`);
            } else {
                console.error(`❌ Failed to update product "${product.nameEn}":`, await updateRes.text());
            }
        }

        // 2. Create "Hot Deals" section
        console.log('\nCreating "Hot Deals" section...');
        const newSection = {
            type: "product_grid",
            order: 1, // Put it near the top
            isActive: true,
            content: {
                title: "Hot Deals",
                filterType: "hot",
                limit: 4,
                styles: {
                    textColor: "#000000",
                    imageAspectRatio: "square",
                    imageFit: "cover"
                }
            }
        };

        const createSectionRes = await fetch(`${baseUrl}/storefront-sections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSection)
        });

        if (createSectionRes.ok) {
            const section = await createSectionRes.json();
            console.log('✅ Created "Hot Deals" section:', section);
        } else {
            console.error('❌ Failed to create section:', await createSectionRes.text());
        }

    } catch (e) {
        console.error('Error during fix:', e);
    }
}

fixHotDeals();
