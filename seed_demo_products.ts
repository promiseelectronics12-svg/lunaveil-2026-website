
import fetch from 'node-fetch';

const demoProducts = [
    {
        nameEn: "Radiant Glow Serum",
        nameBn: "রেডিয়েন্ট গ্লো সিরাম",
        descriptionEn: "A powerful brightening serum with Vitamin C and Hyaluronic Acid for a radiant, youthful glow. Perfect for all skin types.",
        descriptionBn: "ভিটামিন সি এবং হায়ালুরোনিক অ্যাসিড সহ একটি শক্তিশালী ব্রাইটেনিং সিরাম। সব ধরনের ত্বকের জন্য উপযুক্ত।",
        price: "1299",
        discountedPrice: "999",
        stock: 50,
        category: "Skincare",
        images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800"]
    },
    {
        nameEn: "Hydra Moisture Cream",
        nameBn: "হাইড্রা ময়েশ্চার ক্রিম",
        descriptionEn: "Deep hydrating cream with ceramides and natural oils. Locks in moisture for 24 hours of soft, supple skin.",
        descriptionBn: "সিরামাইড এবং প্রাকৃতিক তেল সহ গভীর হাইড্রেটিং ক্রিম। ২৪ ঘন্টা নরম ত্বকের জন্য।",
        price: "899",
        stock: 50,
        category: "Skincare",
        images: ["https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800"]
    },
    {
        nameEn: "Velvet Matte Lipstick - Rose",
        nameBn: "ভেলভেট ম্যাট লিপস্টিক - রোজ",
        descriptionEn: "Long-lasting velvet matte finish lipstick in a beautiful rose shade. Transfer-proof and comfortable wear.",
        descriptionBn: "সুন্দর রোজ শেডে দীর্ঘস্থায়ী ভেলভেট ম্যাট ফিনিশ লিপস্টিক। ট্রান্সফার-প্রুফ।",
        price: "599",
        stock: 50,
        category: "Makeup",
        images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800"],
        isHot: true,
        hotPrice: "449"
    },
    {
        nameEn: "Midnight Recovery Oil",
        nameBn: "মিডনাইট রিকভারি অয়েল",
        descriptionEn: "Premium overnight facial oil with lavender and evening primrose. Wake up to refreshed, rejuvenated skin.",
        descriptionBn: "ল্যাভেন্ডার এবং ইভনিং প্রিমরোজ সহ প্রিমিয়াম রাতের ফেসিয়াল অয়েল।",
        price: "1599",
        stock: 50,
        category: "Skincare",
        images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800"]
    },
    {
        nameEn: "Golden Shimmer Highlighter",
        nameBn: "গোল্ডেন শিমার হাইলাইটার",
        descriptionEn: "Buildable champagne gold highlighter for a stunning glow. Perfect for all skin tones.",
        descriptionBn: "একটি অত্যাশ্চর্য গ্লো জন্য শ্যাম্পেন গোল্ড হাইলাইটার। সব স্কিন টোনের জন্য পারফেক্ট।",
        price: "799",
        discountedPrice: "649",
        stock: 50,
        category: "Makeup",
        images: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800"]
    },
    {
        nameEn: "Rose Water Facial Mist",
        nameBn: "রোজ ওয়াটার ফেসিয়াল মিস্ট",
        descriptionEn: "Refreshing rose water mist to hydrate and tone your skin throughout the day. 100% natural.",
        descriptionBn: "সারাদিন আপনার ত্বককে হাইড্রেট এবং টোন করতে রিফ্রেশিং রোজ ওয়াটার মিস্ট। ১০০% প্রাকৃতিক।",
        price: "399",
        stock: 50,
        category: "Skincare",
        images: ["https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?w=800"],
        isHot: true,
        hotPrice: "299"
    },
    {
        nameEn: "Silk Foundation - Medium",
        nameBn: "সিল্ক ফাউন্ডেশন - মিডিয়াম",
        descriptionEn: "Lightweight, buildable foundation with a natural silk finish. SPF 15 protection included.",
        descriptionBn: "প্রাকৃতিক সিল্ক ফিনিশ সহ হালকা, বিল্ডেবল ফাউন্ডেশন। SPF 15 সুরক্ষা অন্তর্ভুক্ত।",
        price: "1199",
        stock: 50,
        category: "Makeup",
        images: ["https://images.unsplash.com/photo-1631730486784-5f7c6de8c9f4?w=800"]
    },
    {
        nameEn: "Charcoal Detox Mask",
        nameBn: "চারকোল ডিটক্স মাস্ক",
        descriptionEn: "Deep cleansing charcoal mask that draws out impurities. Perfect for oily and combination skin.",
        descriptionBn: "গভীর পরিষ্কার চারকোল মাস্ক যা অমেধ্য বের করে আনে। তৈলাক্ত ত্বকের জন্য উপযুক্ত।",
        price: "549",
        stock: 50,
        category: "Skincare",
        images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"]
    },
    {
        nameEn: "Luxury Eye Palette - Sunset",
        nameBn: "লাক্সারি আই প্যালেট - সানসেট",
        descriptionEn: "12-shade eyeshadow palette with warm sunset tones. Mix of matte and shimmer finishes.",
        descriptionBn: "উষ্ণ সানসেট টোন সহ ১২-শেড আইশ্যাডো প্যালেট। ম্যাট এবং শিমার ফিনিশের মিশ্রণ।",
        price: "1899",
        discountedPrice: "1499",
        stock: 50,
        category: "Makeup",
        images: ["https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=800"]
    },
    {
        nameEn: "Vitamin E Night Cream",
        nameBn: "ভিটামিন ই নাইট ক্রিম",
        descriptionEn: "Nourishing night cream enriched with Vitamin E and Aloe Vera. Repairs and rejuvenates while you sleep.",
        descriptionBn: "ভিটামিন ই এবং অ্যালো ভেরা সমৃদ্ধ পুষ্টিকর নাইট ক্রিম। ঘুমানোর সময় মেরামত করে।",
        price: "749",
        stock: 50,
        category: "Skincare",
        images: ["https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800"]
    },
    {
        nameEn: "Brow Sculpt Pencil",
        nameBn: "ব্রো স্কাল্প পেন্সিল",
        descriptionEn: "Precision brow pencil for perfectly defined brows. Built-in spoolie brush included.",
        descriptionBn: "নিখুঁতভাবে সংজ্ঞায়িত ভ্রুর জন্য প্রিসিশন ব্রো পেন্সিল। বিল্ট-ইন স্পুলি ব্রাশ অন্তর্ভুক্ত।",
        price: "349",
        stock: 50,
        category: "Makeup",
        images: ["https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=800"]
    },
    {
        nameEn: "Coconut Hair Serum",
        nameBn: "কোকোনাট হেয়ার সিরাম",
        descriptionEn: "Lightweight coconut hair serum for frizz-free, shiny hair. Heat protection up to 230°C.",
        descriptionBn: "ফ্রিজ-ফ্রি, চকচকে চুলের জন্য হালকা ওজনের নারিকেল হেয়ার সিরাম।",
        price: "499",
        stock: 50,
        category: "Haircare",
        images: ["https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800"]
    }
];

async function seedDemoProducts() {
    const baseUrl = 'http://localhost:5000/api';

    console.log('🌱 Adding demo products...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const product of demoProducts) {
        try {
            const res = await fetch(`${baseUrl}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });

            if (res.ok) {
                const created = await res.json();
                console.log(`✅ Added: ${product.nameEn}`);
                successCount++;
            } else {
                const error = await res.text();
                console.error(`❌ Failed: ${product.nameEn} - ${error}`);
                errorCount++;
            }
        } catch (e) {
            console.error(`❌ Error: ${product.nameEn} -`, e);
            errorCount++;
        }
    }

    console.log(`\n🎉 Done! Added ${successCount} products, ${errorCount} errors.`);
    console.log('\n📍 Visit http://localhost:5000 to see your homepage!');
}

seedDemoProducts();
