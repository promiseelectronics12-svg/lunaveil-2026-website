
import { db } from './db.sqlite';
import { storefrontSections, products } from '@shared/schema.sqlite';
import { sql } from 'drizzle-orm';

async function seedStorefront() {
    console.log('🌱 Seeding Storefront Demo Content...');

    try {
        // 1. Clear existing sections to avoid duplicates/mess
        await db.delete(storefrontSections);
        console.log('🧹 Cleared existing storefront sections');

        // 2. Add Premium Demo Products (if needed, but let's assume we might need some specific ones for the grid)
        // Let's check if we have enough products, if not add some
        const existingProducts = await db.select().from(products);
        if (existingProducts.length < 4) {
            const premiumProducts = [
                {
                    nameEn: 'Midnight Recovery Concentrate',
                    nameBn: 'মিডনাইট রিকভারি কনসেন্ট্রেট',
                    descriptionEn: 'A replenishing nighttime facial oil with distilled botanicals that visibly restores the appearance of skin by morning.',
                    descriptionBn: 'একটি পুনরুজ্জীবিত রাতের ফেসিয়াল অয়েল।',
                    price: '4500',
                    stock: 50,
                    category: 'Skincare',
                    images: ['https://images.unsplash.com/photo-1571781535009-5363218b1759?q=80&w=2574&auto=format&fit=crop'],
                },
                {
                    nameEn: 'Silk Pillowcase & Eye Mask Set',
                    nameBn: 'সিল্ক পিলোকেস এবং আই মাস্ক সেট',
                    descriptionEn: 'Pure mulberry silk pillowcase and eye mask for beauty sleep.',
                    descriptionBn: 'খাঁটি মালবেরি সিল্কের বালিশের কভার এবং চোখের মাস্ক।',
                    price: '3200',
                    stock: 30,
                    category: 'Accessories',
                    images: ['https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2670&auto=format&fit=crop'],
                },
                {
                    nameEn: 'Hydrating Rose Mist',
                    nameBn: 'হাইড্রেটিং রোজ মিস্ট',
                    descriptionEn: 'Refreshing facial mist with rose water and aloe vera.',
                    descriptionBn: 'গোলাপ জল এবং অ্যালোভেরা সহ সতেজ ফেসিয়াল মিস্ট।',
                    price: '1200',
                    stock: 100,
                    category: 'Skincare',
                    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2574&auto=format&fit=crop'],
                },
                {
                    nameEn: 'Luxury Matte Lipstick - Ruby',
                    nameBn: 'লাক্সারি ম্যাট লিপস্টিক - রুবি',
                    descriptionEn: 'Intense color payoff with a velvet matte finish.',
                    descriptionBn: 'ভেলভেট ম্যাট ফিনিশ সহ তীব্র রঙের লিপস্টিক।',
                    price: '1800',
                    stock: 80,
                    category: 'Makeup',
                    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=2630&auto=format&fit=crop'],
                }
            ];

            for (const p of premiumProducts) {
                await db.insert(products).values(p);
            }
            console.log('✅ Added premium demo products');
        }

        // 3. Insert Storefront Sections
        const sections = [
            // 0. Hero Section (Promotional)
            {
                type: 'hero',
                order: 0,
                isActive: true,
                content: {
                    title: "Redefine Your Beauty",
                    subtitle: "Experience the ultimate collection of premium skincare and cosmetics designed to enhance your natural glow.",
                    image: "https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?q=80&w=2576&auto=format&fit=crop",
                    ctaText: "Shop Collection",
                }
            },
            // 0.5 Marquee
            {
                type: 'marquee',
                order: 1,
                isActive: true,
                content: {
                    text: "New Arrivals  •  Free Shipping on Orders Over ৳2000  •  100% Authentic  •  Premium Quality",
                    speed: "slow",
                    animation: "scroll"
                }
            },

            // 1. Top: "Immersive Story" (Featured Layout)
            {
                type: 'product_grid',
                order: 2,
                isActive: true,
                content: {
                    title: "Signature Scent",
                    layout: "featured",
                    limit: 1,
                    filterType: "hot",
                    styles: {
                        textColor: "#ffffff"
                    }
                }
            },
            // 2. Middle: "New Arrivals" (Carousel Layout)
            {
                type: 'product_grid',
                order: 3,
                isActive: true,
                content: {
                    title: "New Arrivals",
                    layout: "carousel",
                    limit: 6,
                    filterType: "all"
                }
            },
            // 3. Bottom: "Skincare Essentials" (Grid Layout)
            {
                type: 'product_grid',
                order: 4,
                isActive: true,
                content: {
                    title: "Skincare Essentials",
                    layout: "grid",
                    limit: 4,
                    filterType: "all",
                    styles: {
                        columns: 2
                    }
                }
            },
            // 4. Shoppable Video Section
            {
                type: 'shoppable_video',
                order: 1, // High priority to show it off
                isActive: true,
                content: {
                    title: "Get the Glow",
                    subtitle: "Watch how to achieve the perfect radiant look with our new serum.",
                    videoUrl: "https://www.youtube.com/watch?v=3830IsU3rFU",
                    productIds: [], // Will be populated dynamically if we had IDs, but let's rely on the component fetching all for now or we need to fetch IDs first.
                    // Actually, the component filters by IDs. We need real IDs.
                    // Let's fetch the products we just inserted to get their IDs.
                }
            }
        ];

        // Fetch IDs of the products we inserted/checked
        const allProducts = await db.select().from(products);
        const productIds = allProducts.slice(0, 3).map(p => p.id);

        // Update the shoppable video section with real IDs
        const videoSection = sections.find(s => s.type === 'shoppable_video');
        if (videoSection && typeof videoSection.content !== 'string') {
            // @ts-ignore
            videoSection.content.productIds = productIds;
        }

        for (const section of sections) {
            await db.insert(storefrontSections).values(section);
        }
        console.log('✅ Created 5 storefront sections');

        console.log('\n🎉 Storefront seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding storefront:', error);
        process.exit(1);
    }

    process.exit(0);
}

seedStorefront();
