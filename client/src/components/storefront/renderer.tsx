import { useQuery } from "@tanstack/react-query";
import { HeroSection } from "./sections/hero";
import { ProductGridSection } from "./sections/product-grid";
import { BannerSection } from "./sections/banner";
import { MarqueeSection } from "./sections/marquee";
import { ShoppableImageSection } from "./sections/shoppable-image";
import { ShoppableVideoSection } from "./sections/shoppable-video";
import type { StorefrontSection } from "@shared/schema";

import { apiRequest } from "@/lib/queryClient";

export function StorefrontRenderer() {
    const { data: sections = [], isLoading } = useQuery<StorefrontSection[]>({
        queryKey: ["/api/storefront-sections"],
        queryFn: () => apiRequest("GET", "/api/storefront-sections"),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading storefront...</div>
            </div>
        );
    }

    // Sort sections by order
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);

    return (
        <div className="flex flex-col w-full min-h-screen bg-background">
            {sortedSections.map((section) => {
                if (!section.isActive) return null;

                // Parse content if it's a string (SQLite legacy/compatibility)
                // Although drizzle mode: "json" should handle it, let's be safe
                const content = typeof section.content === 'string'
                    ? JSON.parse(section.content)
                    : section.content;

                switch (section.type) {
                    case "hero":
                        return <HeroSection key={section.id} content={content} />;
                    case "product_grid":
                        return <ProductGridSection key={section.id} content={content} />;
                    case "banner":
                        return <BannerSection key={section.id} content={content} />;
                    case "marquee":
                        return <MarqueeSection key={section.id} content={content} />;
                    case "shoppable_image":
                        return <ShoppableImageSection key={section.id} content={content} />;
                    case "shoppable_video":
                        return <ShoppableVideoSection key={section.id} content={content} />;
                    default:
                        return null;
                }
            })}

            {sortedSections.length === 0 && (
                <div className="py-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">Welcome to LunaVeil</h2>
                    <p className="text-muted-foreground">Storefront is currently empty. Please configure sections in the Admin Panel.</p>
                </div>
            )}
        </div>
    );
}
