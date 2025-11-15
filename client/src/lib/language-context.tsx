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
  "admin.pos": { en: "POS Billing", bn: "পিওএস বিলিং" },
  "admin.invoices": { en: "Invoices", bn: "চালান" },
  "admin.settings": { en: "Settings", bn: "সেটিংস" },
  
  // Common
  "common.search": { en: "Search", bn: "খুঁজুন" },
  "common.cancel": { en: "Cancel", bn: "বাতিল" },
  "common.save": { en: "Save", bn: "সংরক্ষণ" },
  "common.delete": { en: "Delete", bn: "মুছুন" },
  "common.edit": { en: "Edit", bn: "সম্পাদনা" },
  "common.loading": { en: "Loading...", bn: "লোড হচ্ছে..." },
  "common.quantity": { en: "Quantity", bn: "পরিমাণ" },
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
