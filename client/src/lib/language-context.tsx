import { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.home": { en: "Home", bn: "হোম" },
  "nav.products": { en: "Products", bn: "পণ্য" },
  "nav.about": { en: "About", bn: "সম্পর্কে" },
  "nav.contact": { en: "Contact", bn: "যোগাযোগ" },

  // Hero
  "hero.title": { en: "Discover Your Beauty", bn: "আপনার সৌন্দর্য আবিষ্কার করুন" },
  "hero.subtitle": { en: "Premium cosmetics delivered to your door", bn: "প্রিমিয়াম প্রসাধনী আপনার দরজায় পৌঁছে দেওয়া হয়" },
  "hero.cta": { en: "Shop Now", bn: "এখনই কিনুন" },
  "hero.redefineTitle": { en: "Redefine Your Beauty", bn: "আপনার সৌন্দর্য নতুন করে সংজ্ঞায়িত করুন" },
  "hero.redefineSubtitle": { en: "Experience the ultimate collection of premium skincare and cosmetics designed to enhance your natural glow.", bn: "প্রিমিয়াম স্কিনকেয়ার এবং প্রসাধনীর চূড়ান্ত সংগ্রহটি উপভোগ করুন যা আপনার প্রাকৃতিক আভা বাড়ানোর জন্য ডিজাইন করা হয়েছে।" },

  // Marquee
  "marquee.newArrivals": { en: "New Arrivals", bn: "নতুন আগমন" },
  "marquee.freeShipping": { en: "Free Shipping on Orders Over ৳2000", bn: "২০০০ টাকার বেশি অর্ডারে ফ্রি শিপিং" },
  "marquee.authentic": { en: "100% Authentic", bn: "১০০% আসল" },
  "marquee.premiumQuality": { en: "Premium Quality", bn: "প্রিমিয়াম কোয়ালিটি" },

  // Product Grid Titles
  "grid.skincareEssentials": { en: "Skincare Essentials", bn: "স্কিনকেয়ার এসেনশিয়ালস" },
  "grid.signatureScent": { en: "Signature Scent", bn: "সিগনেচার সেন্ট" },
  "grid.featuredProducts": { en: "Featured Products", bn: "ফিচারড পণ্য" },
  "grid.newArrivals": { en: "New Arrivals", bn: "নতুন আগমন" },

  // Product
  "product.price": { en: "Price", bn: "মূল্য" },
  "product.addToCart": { en: "Add to Cart", bn: "কার্টে যোগ করুন" },
  "product.outOfStock": { en: "Out of Stock", bn: "স্টক শেষ" },
  "product.inStock": { en: "In Stock", bn: "স্টকে আছে" },
  "product.description": { en: "Description", bn: "বর্ণনা" },

  // Checkout
  "checkout.title": { en: "Checkout", bn: "চেকআউট" },
  "checkout.customerInfo": { en: "Customer Information", bn: "গ্রাহক তথ্য" },
  "checkout.name": { en: "Full Name", bn: "পুরো নাম" },
  "checkout.phone": { en: "Phone Number", bn: "ফোন নম্বর" },
  "checkout.address": { en: "Full Address", bn: "সম্পূর্ণ ঠিকানা" },
  "checkout.deliveryLocation": { en: "Delivery Location", bn: "ডেলিভারি অবস্থান" },
  "checkout.insideDhaka": { en: "Inside Dhaka", bn: "ঢাকার ভিতরে" },
  "checkout.outsideDhaka": { en: "Outside Dhaka", bn: "ঢাকার বাইরে" },
  "checkout.orderSummary": { en: "Order Summary", bn: "অর্ডার সারাংশ" },
  "checkout.subtotal": { en: "Subtotal", bn: "উপমোট" },
  "checkout.delivery": { en: "Delivery Charge", bn: "ডেলিভারি চার্জ" },
  "checkout.total": { en: "Total", bn: "মোট" },
  "checkout.placeOrder": { en: "Place Order", bn: "অর্ডার করুন" },
  "checkout.cod": { en: "Cash on Delivery (COD)", bn: "ক্যাশ অন ডেলিভারি" },

  // Footer
  "footer.about": { en: "About", bn: "সম্পর্কে" },
  "footer.quickLinks": { en: "Quick Links", bn: "দ্রুত লিঙ্ক" },
  "footer.contact": { en: "Contact", bn: "যোগাযোগ" },
  "footer.payment": { en: "Payment & Delivery", bn: "পেমেন্ট ও ডেলিভারি" },
  "footer.copyright": { en: "© LUNAVEIL – All Rights Reserved", bn: "© লুনাভেইল – সর্বস্বত্ব সংরক্ষিত" },

  // Admin
  "admin.dashboard": { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  "admin.products": { en: "Products", bn: "পণ্য" },
  "admin.orders": { en: "Orders", bn: "অর্ডার" },
  "admin.collections": { en: "Collections", bn: "কালেকশন" },
  "admin.storefront": { en: "Storefront", bn: "স্টোরফ্রন্ট" },
  "admin.pos": { en: "POS Billing", bn: "পিওএস বিলিং" },
  "admin.invoices": { en: "Invoices", bn: "চালান" },
  "admin.users": { en: "Users", bn: "ব্যবহারকারী" },
  "admin.settings": { en: "Settings", bn: "সেটিংস" },

  // Common
  "common.search": { en: "Search", bn: "খুঁজুন" },
  "common.cancel": { en: "Cancel", bn: "বাতিল" },
  "common.save": { en: "Save", bn: "সংরক্ষণ" },
  "common.delete": { en: "Delete", bn: "মুছুন" },
  "common.edit": { en: "Edit", bn: "সম্পাদনা" },
  "common.loading": { en: "Loading...", bn: "লোড হচ্ছে..." },
  "common.quantity": { en: "Quantity", bn: "পরিমাণ" },
  "common.videoUnavailable": { en: "Video unavailable", bn: "ভিডিও অনুপলব্ধ" },
  "common.checkUrl": { en: "Please check the URL.", bn: "অনুগ্রহ করে URL চেক করুন।" },
  "common.addedToCart": { en: "Added to cart", bn: "কার্টে যোগ করা হয়েছে" },

  // Shoppable Video
  "shoppable.shopTheLook": { en: "Shop the Look", bn: "লুক কিনুন" },
  "shoppable.getTheLook": { en: "Get the Look", bn: "লুক পান" },
  "shoppable.featuredProducts": { en: "Featured products from this video.", bn: "এই ভিডিওর পণ্যসমূহ।" },
  "shoppable.add": { en: "Add", bn: "যোগ" },
  "shoppable.noProducts": { en: "No products linked to this video.", bn: "এই ভিডিওতে কোন পণ্য নেই।" },
  "shoppable.viewAll": { en: "View All Products", bn: "সব পণ্য দেখুন" },
  "shoppable.getTheGlowTitle": { en: "Get the Glow", bn: "উজ্জ্বলতা পান" },
  "shoppable.getTheGlowSubtitle": { en: "Watch how to achieve the perfect radiant look with our new serum.", bn: "আমাদের নতুন সিরাম দিয়ে কীভাবে নিখুঁত উজ্জ্বল লুক পাবেন তা দেখুন।" },

  // Banner
  "banner.welcome": { en: "Welcome to our store", bn: "আমাদের দোকানে স্বাগতম" },

  // Product Details
  "product.details": { en: "Product details and information", bn: "পণ্যের বিস্তারিত তথ্য" },
  "product.noImage": { en: "No image", bn: "ছবি নেই" },
  "product.stockLabel": { en: "Stock", bn: "স্টক" },
  "product.units": { en: "units", bn: "টি" },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "en" || saved === "bn")) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
