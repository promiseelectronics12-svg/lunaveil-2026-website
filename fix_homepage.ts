import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000/api';

async function fixHeroAndSections() {
    console.log('🔧 Fixing homepage sections...\n');

    // 1. Fix the Hero Section
    console.log('1️⃣ Updating Hero Section...');
    try {
        const heroRes = await fetch(`${baseUrl}/storefront-sections/fbe56044-38bc-4d08-ad97-f3b6d3ed22d0`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order: 1,
                content: {
                    title: "Discover Your Natural Glow",
                    subtitle: "Premium skincare & cosmetics crafted with love",
                    image: "https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?w=1200",
                    ctaText: "Shop Collection",
                    ctaLink: "/products",
                    styles: {
                        variant: "overlay",
                        height: "85vh",
                        overlayOpacity: 35,
                        textAlign: "center",
                        textColor: "#ffffff",
                        buttonSize: "large",
                        padding: "medium"
                    }
                }
            })
        });

        if (heroRes.ok) {
            console.log('   ✅ Hero section updated: Full-screen overlay with better copy');
        } else {
            console.log('   ❌ Failed to update hero:', await heroRes.text());
        }
    } catch (e) {
        console.error('   ❌ Error:', e);
    }

    // 2. Create a marquee/promo banner at the top
    console.log('\n2️⃣ Creating top promo marquee...');
    try {
        const marqueeRes = await fetch(`${baseUrl}/storefront-sections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'marquee',
                order: 0,
                isActive: true,
                content: {
                    text: "✨ FREE SHIPPING on orders over ৳2,000 • Use code GLOW20 for 20% off ✨",
                    speed: "normal",
                    styles: {
                        backgroundColor: "#1a1a1a",
                        textColor: "#ffffff"
                    }
                }
            })
        });

        if (marqueeRes.ok) {
            console.log('   ✅ Marquee banner created at top');
        } else {
            console.log('   ⚠️ Marquee may already exist or failed');
        }
    } catch (e) {
        console.error('   ❌ Error:', e);
    }

    // 3. Update Hot Deals section
    console.log('\n3️⃣ Updating Hot Deals section...');
    try {
        const hotDealsRes = await fetch(`${baseUrl}/storefront-sections/167dde9f-5f0b-4dae-b543-2f92d921d115`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order: 3,
                content: {
                    title: "🔥 Hot Deals",
                    filterType: "hot",
                    limit: 4,
                    styles: {
                        textColor: "#1a1a1a",
                        imageAspectRatio: "portrait",
                        imageFit: "cover",
                        showBadges: true
                    }
                }
            })
        });

        if (hotDealsRes.ok) {
            console.log('   ✅ Hot Deals moved to order 3 with better styling');
        } else {
            console.log('   ❌ Failed:', await hotDealsRes.text());
        }
    } catch (e) {
        console.error('   ❌ Error:', e);
    }

    // 4. Update "Our Products" section
    console.log('\n4️⃣ Updating Products section...');
    try {
        const productsRes = await fetch(`${baseUrl}/storefront-sections/000946d9-1b73-4973-8e0b-33ab878ee24d`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order: 2,
                content: {
                    title: "Bestsellers",
                    limit: 8,
                    styles: {
                        textColor: "#1a1a1a",
                        imageAspectRatio: "portrait",
                        imageFit: "cover",
                        columns: 2
                    }
                }
            })
        });

        if (productsRes.ok) {
            console.log('   ✅ Products section updated: "Bestsellers" at order 2');
        } else {
            console.log('   ❌ Failed:', await productsRes.text());
        }
    } catch (e) {
        console.error('   ❌ Error:', e);
    }

    // 5. Move old banner lower or deactivate
    console.log('\n5️⃣ Adjusting old banner...');
    try {
        const bannerRes = await fetch(`${baseUrl}/storefront-sections/b73bdb2f-6781-4c0b-b680-130e0ebf00ad`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order: 4,
                isActive: false  // Hide it since we have marquee now
            })
        });

        if (bannerRes.ok) {
            console.log('   ✅ Old banner deactivated (replaced by marquee)');
        }
    } catch (e) {
        console.error('   ❌ Error:', e);
    }

    console.log('\n✨ Quick fixes complete! New section order:');
    console.log('   0. Marquee (promo banner at top)');
    console.log('   1. Hero (full-screen, 85vh)');
    console.log('   2. Bestsellers (8 products)');
    console.log('   3. Hot Deals (4 hot products)');
    console.log('\n📍 Refresh http://localhost:5000 to see changes!');
}

fixHeroAndSections();
