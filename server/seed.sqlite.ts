// SQLite Seed Script - Creates initial data for testing
import { db } from './db.sqlite';
import { adminUsers, products, companySettings } from '@shared/schema.sqlite';
import bcrypt from 'bcrypt';

async function seed() {
    console.log('🌱 Seeding SQLite database...');

    try {
        // Check if admin user already exists
        const existingUsers = await db.select().from(adminUsers);
        if (existingUsers.length === 0) {
            // Create default admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.insert(adminUsers).values({
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
            });
            console.log('✅ Created default admin user (username: admin, password: admin123)');
        } else {
            console.log('ℹ️ Admin user already exists, skipping...');
        }

        // Check if company settings exist
        const existingSettings = await db.select().from(companySettings);
        if (existingSettings.length === 0) {
            await db.insert(companySettings).values({
                companyName: 'LUNAVEIL',
                companyPhone: '+880 1234-567890',
                companyAddress: 'Dhaka, Bangladesh',
                companyEmail: 'info@lunaveil.com',
                invoiceFooterText: 'Thank you for shopping with LUNAVEIL',
                deliveryChargeInsideDhaka: '60',
                deliveryChargeOutsideDhaka: '120',
            });
            console.log('✅ Created default company settings');
        } else {
            console.log('ℹ️ Company settings already exist, skipping...');
        }

        // Check if products exist
        const existingProducts = await db.select().from(products);
        if (existingProducts.length === 0) {
            // Add sample products
            const sampleProducts = [
                {
                    nameEn: 'Radiant Glow Serum',
                    nameBn: 'রেডিয়েন্ট গ্লো সিরাম',
                    descriptionEn: 'A powerful vitamin C serum for bright, glowing skin',
                    descriptionBn: 'উজ্জ্বল, দীপ্তিময় ত্বকের জন্য একটি শক্তিশালী ভিটামিন সি সিরাম',
                    price: '1299',
                    discountedPrice: '999',
                    stock: 50,
                    category: 'Skincare',
                    images: ['https://images.unsplash.com/photo-1571781535009-5363218b1759?q=80&w=2574&auto=format&fit=crop'],
                },
                {
                    nameEn: 'Hydra Moisture Cream',
                    nameBn: 'হাইড্রা ময়েশ্চার ক্রিম',
                    descriptionEn: 'Deep hydrating cream for all skin types',
                    descriptionBn: 'সব ধরনের ত্বকের জন্য গভীর হাইড্রেটিং ক্রিম',
                    price: '899',
                    stock: 75,
                    category: 'Skincare',
                    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2574&auto=format&fit=crop'],
                },
                {
                    nameEn: 'Velvet Matte Lipstick',
                    nameBn: 'ভেলভেট ম্যাট লিপস্টিক',
                    descriptionEn: 'Long-lasting matte finish lipstick',
                    descriptionBn: 'দীর্ঘস্থায়ী ম্যাট ফিনিশ লিপস্টিক',
                    price: '599',
                    discountedPrice: '449',
                    stock: 100,
                    category: 'Makeup',
                    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=2630&auto=format&fit=crop'],
                },
                {
                    nameEn: 'Rose Petal Face Wash',
                    nameBn: 'রোজ পেটাল ফেস ওয়াশ',
                    descriptionEn: 'Gentle cleansing with natural rose extracts',
                    descriptionBn: 'প্রাকৃতিক গোলাপ নির্যাস দিয়ে মৃদু পরিষ্কার',
                    price: '450',
                    stock: 60,
                    category: 'Skincare',
                    images: ['https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=2572&auto=format&fit=crop'],
                },
                {
                    nameEn: 'Luminous Foundation',
                    nameBn: 'লুমিনাস ফাউন্ডেশন',
                    descriptionEn: 'Medium coverage foundation with SPF 15',
                    descriptionBn: 'এসপিএফ ১৫ সহ মিডিয়াম কভারেজ ফাউন্ডেশন',
                    price: '1599',
                    discountedPrice: '1299',
                    stock: 40,
                    category: 'Makeup',
                    images: ['https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2670&auto=format&fit=crop'],
                },
            ];

            for (const product of sampleProducts) {
                await db.insert(products).values(product);
            }
            console.log('✅ Created 5 sample products');
        } else {
            console.log('ℹ️ Products already exist, skipping...');
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📋 You can now run the application with:');
        console.log('   npm run dev:sqlite');
        console.log('\n🔐 Login with:');
        console.log('   Username: admin');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }

    process.exit(0);
}

seed();
