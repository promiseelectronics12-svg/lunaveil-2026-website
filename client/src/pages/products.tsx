import { useState } from "react";
import { CustomerHeader } from "@/components/customer-header";
import { CustomerFooter } from "@/components/customer-footer";
import { ProductCard } from "@/components/product-card";
import { ProductDetailDialog } from "@/components/product-detail-dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { Search, X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/cart-context";
import { MobileNav } from "@/components/mobile-nav";
import { MobileMenu } from "@/components/mobile-menu";

export default function ProductsPage() {
    const { language, t } = useLanguage();
    const [, setLocation] = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartTotal,
        cartOpen,
        setCartOpen
    } = useCart();

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ["/api/products"],
    });

    const filteredProducts = products.filter((product) => {
        const name = language === "bn" ? product.nameBn : product.nameEn;
        const description = language === "bn" ? product.descriptionBn : product.descriptionEn;
        const query = searchQuery.toLowerCase();
        return name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
    });

    const proceedToCheckout = () => {
        setLocation("/checkout");
    };

    const handleViewDetails = (product: Product) => {
        setSelectedProduct(product);
        setDetailDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
            <CustomerHeader cartItemCount={cart.length} onCartClick={() => setCartOpen(true)} />

            <main className="flex-1">
                <section id="products" className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h2 className="text-4xl font-serif font-bold text-center mb-4 text-foreground">
                            {t("nav.products")}
                        </h2>
                        <div className="max-w-md mx-auto relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={t("common.search")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                                data-testid="input-product-search"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Card key={i} className="overflow-hidden">
                                    <Skeleton className="aspect-square w-full" />
                                    <div className="p-4 space-y-3">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-6 w-1/3" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-16">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg text-muted-foreground">
                                {searchQuery ? "No products found" : "No products available"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={addToCart}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <CustomerFooter />

            <ProductDetailDialog
                product={selectedProduct}
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                onAddToCart={addToCart}
            />

            <MobileNav
                cartItemCount={cart.length}
                onCartClick={() => setCartOpen(true)}
                onMenuClick={() => setMobileMenuOpen(true)}
            />

            <MobileMenu
                open={mobileMenuOpen}
                onOpenChange={setMobileMenuOpen}
            />

            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{t("checkout.orderSummary")}</SheetTitle>
                    </SheetHeader>

                    <div className="mt-8 flex flex-col h-[calc(100vh-8rem)]">
                        {cart.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">{t("product.addToCart")}</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto space-y-4">
                                    {cart.map((item) => {
                                        const name = language === "bn" ? item.nameBn : item.nameEn;
                                        return (
                                            <Card key={item.id} className="p-4" data-testid={`cart-item-${item.id}`}>
                                                <div className="flex gap-4">
                                                    {item.images && item.images[0] && (
                                                        <img
                                                            src={item.images[0]}
                                                            alt={name}
                                                            className="w-20 h-20 object-cover rounded-md"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-sm mb-1" data-testid={`text-cart-item-name-${item.id}`}>{name}</h4>
                                                        <div className="flex items-baseline gap-2">
                                                            {item.discountedPrice ? (
                                                                <>
                                                                    <span className="text-sm text-muted-foreground line-through">৳{item.price}</span>
                                                                    <span className="text-primary font-semibold">৳{item.discountedPrice}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-primary font-semibold">৳{item.price}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-7 w-7"
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                                data-testid={`button-decrease-${item.id}`}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="text-sm font-medium w-8 text-center" data-testid={`text-quantity-${item.id}`}>
                                                                {item.quantity}
                                                            </span>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-7 w-7"
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                data-testid={`button-increase-${item.id}`}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7"
                                                        onClick={() => removeFromCart(item.id)}
                                                        data-testid={`button-remove-${item.id}`}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>

                                <div className="border-t pt-4 space-y-4">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>{t("checkout.subtotal")}</span>
                                        <span data-testid="text-cart-total">৳{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={proceedToCheckout}
                                        data-testid="button-proceed-checkout"
                                    >
                                        {t("checkout.placeOrder")}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
