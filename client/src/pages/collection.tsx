import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Collection } from "@shared/schema";
import { CustomerHeader } from "@/components/customer-header";
import { CustomerFooter } from "@/components/customer-footer";
import { MobileNav } from "@/components/mobile-nav";
import { MobileMenu } from "@/components/mobile-menu";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export default function CollectionPage() {
    const [, params] = useRoute("/collections/:slug");
    const slug = params?.slug;
    const { cart, setCartOpen } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: collection, isLoading } = useQuery<Collection>({
        queryKey: [`/api/collections/slug/${slug}`],
        queryFn: () => apiRequest("GET", `/api/collections/slug/${slug}`),
        enabled: !!slug,
    });

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!collection) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <CustomerHeader cartItemCount={cart.length} onCartClick={() => setCartOpen(true)} />
                <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Collection not found</h1>
                        <p className="text-muted-foreground mt-2">The collection you are looking for does not exist.</p>
                    </div>
                </main>
                <CustomerFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
            <CustomerHeader cartItemCount={cart.length} onCartClick={() => setCartOpen(true)} />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">{collection.name}</h1>
                    {collection.image && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-8">
                            <img
                                src={collection.image}
                                alt={collection.name}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                    )}
                    {collection.description && (
                        <p className="text-lg text-muted-foreground mb-8">{collection.description}</p>
                    )}

                    <div className="mt-12 border-t pt-8">
                        <h2 className="text-2xl font-semibold mb-4">Products</h2>
                        <p className="text-muted-foreground italic">Products in this collection will appear here soon.</p>
                    </div>
                </div>
            </main>

            <CustomerFooter />
            <MobileNav
                cartItemCount={cart.length}
                onCartClick={() => setCartOpen(true)}
                onMenuClick={() => setMobileMenuOpen(true)}
            />
            <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        </div>
    );
}
