import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { Product, Promotion } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, openDrawer?: boolean) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, change: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
    activePromotions: Promotion[];
    appliedPromotion?: Promotion;
    discountAmount: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const { toast } = useToast();
    const { language } = useLanguage();

    const { data: activePromotions = [] } = useQuery<Promotion[]>({
        queryKey: ["/api/promotions/active"],
        queryFn: () => apiRequest("GET", "/api/promotions/active"),
    });

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from localStorage", e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product, openDrawer: boolean = true) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast({
                        title: language === "bn" ? "স্টক শেষ" : "Out of Stock",
                        description: language === "bn" ? "আর পণ্য নেই" : "No more items available",
                        variant: "destructive",
                    });
                    return prev;
                }
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        if (openDrawer) {
            // Only open drawer on desktop (width >= 768px)
            if (window.innerWidth >= 768) {
                setCartOpen(true);
            }
        }
        toast({
            title: language === "bn" ? "কার্টে যোগ করা হয়েছে" : "Added to Cart",
            description: language === "bn" ? product.nameBn : product.nameEn,
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, change: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.id === productId) {
                        const newQuantity = item.quantity + change;
                        if (newQuantity > item.stock) {
                            toast({
                                title: language === "bn" ? "স্টক শেষ" : "Out of Stock",
                                variant: "destructive",
                            });
                            return item;
                        }
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                })
                .filter((item) => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((sum, item) => {
        const price = item.discountedPrice
            ? parseFloat(item.discountedPrice.toString())
            : parseFloat(item.price.toString());
        return sum + price * item.quantity;
    }, 0);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const { appliedPromotion, discountAmount } = useMemo(() => {
        let bestDiscount = 0;
        let bestPromo: Promotion | undefined = undefined;

        for (const promo of activePromotions) {
            const minOrder = parseFloat(promo.minOrderValue?.toString() || "0");
            if (cartTotal >= minOrder) {
                let currentDiscount = 0;
                if (promo.type === "percentage_discount") {
                    const val = parseFloat(promo.value?.toString() || "0");
                    currentDiscount = (cartTotal * val) / 100;
                    const max = parseFloat(promo.maxDiscount?.toString() || "0");
                    if (max > 0 && currentDiscount > max) {
                        currentDiscount = max;
                    }
                } else if (promo.type === "fixed_discount") {
                    currentDiscount = parseFloat(promo.value?.toString() || "0");
                }
                // free_delivery is handled in checkout/delivery charge calculation, 
                // but we can still mark it as applied if it's the only one or prioritized.
                // For now, let's prioritize monetary discounts on subtotal.

                if (currentDiscount > bestDiscount) {
                    bestDiscount = currentDiscount;
                    bestPromo = promo;
                } else if (promo.type === "free_delivery" && bestDiscount === 0) {
                    // If no monetary discount yet, free delivery is the best so far
                    bestPromo = promo;
                }
            }
        }
        return { appliedPromotion: bestPromo, discountAmount: bestDiscount };
    }, [cartTotal, activePromotions]);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartOpen,
                setCartOpen,
                activePromotions,
                appliedPromotion,
                discountAmount,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
