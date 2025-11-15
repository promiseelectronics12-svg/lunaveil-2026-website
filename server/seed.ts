import { db } from "./db";
import { products } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database with initial data...");

  const productImages = [
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1631214524220-ca646409c617?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
  ];

  const sampleProducts = [
    {
      nameEn: "Hydrating Serum",
      nameBn: "হাইড্রেটিং সিরাম",
      descriptionEn: "Intensive hydration serum with vitamin C for glowing skin",
      descriptionBn: "উজ্জ্বল ত্বকের জন্য ভিটামিন সি সহ ইনটেনসিভ হাইড্রেশন সিরাম",
      price: "1200",
      stock: 45,
      category: "Skincare",
      images: [productImages[0]],
    },
    {
      nameEn: "Moisturizing Cream",
      nameBn: "ময়েশ্চারাইজিং ক্রিম",
      descriptionEn: "Rich moisturizing cream for all skin types",
      descriptionBn: "সকল ত্বকের ধরনের জন্য সমৃদ্ধ ময়েশ্চারাইজিং ক্রিম",
      price: "950",
      stock: 60,
      category: "Skincare",
      images: [productImages[1]],
    },
    {
      nameEn: "Luxury Lipstick",
      nameBn: "লাক্সারি লিপস্টিক",
      descriptionEn: "Long-lasting matte lipstick in rich colors",
      descriptionBn: "সমৃদ্ধ রঙে দীর্ঘস্থায়ী ম্যাট লিপস্টিক",
      price: "850",
      stock: 80,
      category: "Makeup",
      images: [productImages[2]],
    },
    {
      nameEn: "Eye Shadow Palette",
      nameBn: "আই শ্যাডো প্যালেট",
      descriptionEn: "12-color professional eye shadow palette",
      descriptionBn: "১২-রঙের পেশাদার আই শ্যাডো প্যালেট",
      price: "1500",
      stock: 35,
      category: "Makeup",
      images: [productImages[3]],
    },
    {
      nameEn: "Face Mask",
      nameBn: "ফেস মাস্ক",
      descriptionEn: "Purifying clay face mask for deep cleansing",
      descriptionBn: "গভীর পরিষ্কারের জন্য পিউরিফাইং ক্লে ফেস মাস্ক",
      price: "650",
      stock: 8,
      category: "Skincare",
      images: [productImages[4]],
    },
    {
      nameEn: "Perfume Spray",
      nameBn: "পারফিউম স্প্রে",
      descriptionEn: "Elegant floral fragrance for women",
      descriptionBn: "মহিলাদের জন্য মার্জিত ফুলের সুগন্ধি",
      price: "2200",
      stock: 25,
      category: "Fragrance",
      images: [productImages[5]],
    },
  ];

  // Check if products already exist
  const existingProducts = await db.select().from(products);
  
  if (existingProducts.length === 0) {
    console.log("📦 Inserting sample products...");
    await db.insert(products).values(sampleProducts);
    console.log("✅ Seed completed successfully!");
  } else {
    console.log("ℹ️  Database already contains products, skipping seed.");
  }

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
