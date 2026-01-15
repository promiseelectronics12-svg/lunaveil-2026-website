import { Home, Search, ShoppingCart, User, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useFlyToCart } from "@/lib/fly-to-cart-context";
import { motion, AnimatePresence } from "framer-motion";

interface MobileNavProps {
    cartItemCount: number;
    onCartClick: () => void;
    onMenuClick: () => void;
}

export function MobileNav({ cartItemCount, onCartClick, onMenuClick }: MobileNavProps) {
    const { language } = useLanguage();
    const [location] = useLocation();
    const cartIconRef = useRef<HTMLDivElement>(null);
    const [isBouncing, setIsBouncing] = useState(false);

    // Register cart icon with fly context
    const { registerCartIcon } = useFlyToCart();

    // Register cart icon on mount
    useEffect(() => {
        if (registerCartIcon && cartIconRef.current) {
            registerCartIcon(cartIconRef.current);
        }
    }, [registerCartIcon]);

    // Listen for cart item added events
    useEffect(() => {
        const handleCartItemAdded = () => {
            setIsBouncing(true);
            setTimeout(() => setIsBouncing(false), 500);
        };

        window.addEventListener('cartItemAdded', handleCartItemAdded);
        return () => window.removeEventListener('cartItemAdded', handleCartItemAdded);
    }, []);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t md:hidden pb-safe">
            <nav className="flex items-stretch h-16">
                {/* Home */}
                <a
                    href="/"
                    className={`flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors ${location === "/" ? "text-foreground" : "text-muted-foreground"
                        }`}
                >
                    <Home className="h-5 w-5" />
                    <span className="text-[10px] font-medium">
                        {language === "bn" ? "হোম" : "Home"}
                    </span>
                </a>

                {/* Shop */}
                <a
                    href="/products"
                    className={`flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors ${location === "/products" ? "text-foreground" : "text-muted-foreground"
                        }`}
                >
                    <Sparkles className="h-5 w-5" />
                    <span className="text-[10px] font-medium">
                        {language === "bn" ? "শপ" : "Shop"}
                    </span>
                </a>

                {/* Search */}


                {/* Bag - with bounce animation */}
                <button
                    onClick={onCartClick}
                    className="flex flex-col items-center justify-center flex-1 gap-0.5 text-muted-foreground active:text-foreground transition-colors"
                    type="button"
                >
                    <motion.div
                        ref={cartIconRef}
                        className="relative"
                        animate={isBouncing ? {
                            scale: [1, 1.4, 0.9, 1.2, 1],
                            rotate: [0, -10, 10, -5, 0],
                        } : {}}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        <AnimatePresence>
                            {cartItemCount > 0 && (
                                <motion.div
                                    key={cartItemCount}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1.5 -right-2.5 h-4 min-w-4 flex items-center justify-center px-1 text-[9px] font-bold"
                                    >
                                        {cartItemCount}
                                    </Badge>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pulse ring effect when bouncing */}
                        {isBouncing && (
                            <motion.div
                                className="absolute inset-0 rounded-full bg-rose-500"
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 2.5, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        )}
                    </motion.div>
                    <span className="text-[10px] font-medium">
                        {language === "bn" ? "ব্যাগ" : "Bag"}
                    </span>
                </button>


            </nav>
        </div>
    );
}
