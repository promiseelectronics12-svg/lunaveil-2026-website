import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, ShoppingBag, Star } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { useState, useRef, useEffect } from "react";
import type { Product } from "@shared/schema";
import { useFlyToCart } from "@/lib/fly-to-cart-context";
import { ProductDetailDialog } from "@/components/product-detail-dialog";

interface ProductGridSectionProps {
    content: {
        title?: string;
        collectionId?: string;
        limit?: number;
        filterType?: "all" | "collection" | "hot";
        layout?: "grid" | "carousel" | "featured";
        styles?: {
            backgroundImage?: string;
            overlayOpacity?: number;
            textColor?: string;
            fadeEdges?: boolean;
            fadePercentage?: number;
            imageAspectRatio?: "square" | "portrait" | "auto";
            imageFit?: "cover" | "contain";
            columns?: number;
        };
    };
}

// Helper hook for product logic
function useProductLogic(product: Product) {
    const { language } = useLanguage();
    const { addToCart } = useCart();
    const [isLiked, setIsLiked] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const { triggerFly } = useFlyToCart();

    const name = language === "bn" ? product.nameBn : product.nameEn;
    const isHot = product.isHot;
    const hotPrice = product.hotPrice ? parseFloat(product.hotPrice) : null;
    const regularPrice = parseFloat(product.price);
    const discountedPrice = product.discountedPrice ? parseFloat(product.discountedPrice) : null;

    let displayPrice = regularPrice;
    let originalPrice: number | null = null;

    if (isHot && hotPrice) {
        displayPrice = hotPrice;
        originalPrice = regularPrice;
    } else if (discountedPrice) {
        displayPrice = discountedPrice;
        originalPrice = regularPrice;
    }

    const percentOff = originalPrice
        ? Math.round((1 - displayPrice / originalPrice) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAdding(true);

        if (triggerFly && imageRef.current) {
            const imageUrl = product.images?.[0] || "https://via.placeholder.com/400x500";
            triggerFly(imageUrl, imageRef.current);
        }

        addToCart(product);
        setTimeout(() => setIsAdding(false), 600);
    };

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLiked(!isLiked);
    };

    return {
        name,
        isHot,
        displayPrice,
        originalPrice,
        percentOff,
        isLiked,
        isAdding,
        imageRef,
        handleAddToCart,
        handleLike
    };
}

// 1. Featured Slideshow Component
function FeaturedProductSlideshow({ products, onProductClick }: { products: Product[], onProductClick: (product: Product) => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (products.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 4000); // Change every 4 seconds
        return () => clearInterval(interval);
    }, [products.length]);

    const product = products[currentIndex];
    if (!product) return null;

    return (
        <div className="w-full mb-8 relative rounded-3xl overflow-hidden shadow-xl aspect-[4/5]">
            <AnimatePresence mode="wait">
                <FeaturedSlide key={product.id} product={product} onProductClick={onProductClick} />
            </AnimatePresence>
        </div>
    );
}

function FeaturedSlide({ product, onProductClick }: { product: Product, onProductClick: (product: Product) => void }) {
    const {
        name,
        displayPrice,
        imageRef,
        handleAddToCart
    } = useProductLogic(product);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }} // Soft fade effect
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={() => onProductClick(product)}
        >
            <img
                ref={imageRef}
                src={product.images?.[0] || "https://via.placeholder.com/400x500"}
                alt={name}
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-24">
                <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white text-2xl font-bold mb-1"
                >
                    {name}
                </motion.h3>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/90 font-medium text-lg mb-4"
                >
                    ৳{displayPrice.toLocaleString()}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Button
                        onClick={handleAddToCart}
                        className="w-full bg-white text-black hover:bg-white/90 font-bold h-12 rounded-full"
                    >
                        Add to Cart
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
}



// 2. Editorial (Carousel) Card
function CarouselProductCard({ product, onProductClick }: { product: Product, onProductClick: (product: Product) => void }) {
    const {
        name,
        displayPrice,
        imageRef,
        handleAddToCart
    } = useProductLogic(product);

    return (
        <div className="min-w-[160px] w-[40vw] snap-center flex flex-col gap-3 group cursor-pointer">
            <div onClick={() => onProductClick(product)}>
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted relative">
                    <img
                        ref={imageRef}
                        src={product.images?.[0] || "https://via.placeholder.com/400x500"}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
            </div>
            <div>
                <h3 className="text-sm font-medium truncate mb-1" onClick={() => onProductClick(product)}>{name}</h3>
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">৳{displayPrice.toLocaleString()}</span>
                    <button
                        onClick={handleAddToCart}
                        className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-110 transition-transform"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// 3. Quick Shop (Grid) Card - (Renamed from MobileProductCard)
function GridProductCard({ product, index, onProductClick }: { product: Product; index: number, onProductClick: (product: Product) => void }) {
    const {
        name,
        isHot,
        displayPrice,
        originalPrice,
        percentOff,
        isLiked,
        isAdding,
        imageRef,
        handleAddToCart,
        handleLike
    } = useProductLogic(product);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group"
        >
            <div className="relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-muted/30 cursor-pointer" onClick={() => onProductClick(product)}>
                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleLike(e); }}
                        className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    >
                        <Heart
                            className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                        />
                    </button>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                        {isHot && (
                            <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg animate-pulse">
                                🔥 HOT
                            </span>
                        )}
                        {percentOff > 0 && (
                            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white rounded-full shadow-md">
                                -{percentOff}% OFF
                            </span>
                        )}
                    </div>

                    {/* Product Image */}
                    <img
                        ref={imageRef}
                        src={product.images?.[0] || "https://via.placeholder.com/400x500"}
                        alt={name}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Quick Add Overlay - Shows on hover (desktop) */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                        <Button
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(e); }}
                            className="w-full rounded-full bg-white text-black hover:bg-white/90 font-medium"
                            size="sm"
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Quick Add
                        </Button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-3.5">
                    {/* Rating - fake for now, should come from API */}
                    <div className="flex items-center gap-1 mb-1.5">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-3 h-3 ${star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">(24)</span>
                    </div>

                    {/* Product Name */}
                    <div onClick={() => onProductClick(product)} className="cursor-pointer">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight mb-2 hover:underline">
                            {name}
                        </h3>
                    </div>

                    {/* Price Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold text-foreground">
                                ৳{displayPrice.toLocaleString()}
                            </span>
                            {originalPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                    ৳{originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Mobile Quick Add Button */}
                        <button
                            onClick={handleAddToCart}
                            className={`md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all ${isAdding
                                ? 'bg-green-500 text-white scale-110'
                                : 'bg-foreground text-background hover:scale-105'
                                }`}
                        >
                            {isAdding ? '✓' : <ShoppingBag className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function ProductGridSection({ content }: ProductGridSectionProps) {
    const { language, t } = useLanguage();

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ["/api/products", content.filterType === "hot" ? { isHot: "true" } : {}],
        queryFn: async () => {
            const url = new URL("/api/products", window.location.origin);
            if (content.filterType === "hot") {
                url.searchParams.append("isHot", "true");
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch products");
            return res.json();
        }
    });

    const layout = content.layout || "grid";
    // For featured layout (slideshow), we want more products even if limit is 1
    const limit = layout === 'featured' ? 5 : (content.limit || 8);
    const displayProducts = products.slice(0, limit);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const { addToCart } = useCart();

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setDetailDialogOpen(true);
    };

    // Auto-scroll logic removed in favor of framer-motion marquee

    if (isLoading) {
        return (
            <section className="py-12 px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-muted/50 rounded-2xl aspect-[3/4] animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    const styles = content.styles || {};
    const backgroundImage = styles.backgroundImage;
    const overlayOpacity = (styles.overlayOpacity ?? 0) / 100;
    const fadeEdges = styles.fadeEdges;
    const fadePercentage = styles.fadePercentage || 10;
    const textColor = styles.textColor || "inherit";
    const columns = styles.columns || 2;

    const getTranslatedTitle = (title?: string) => {
        if (!title) return t("grid.featuredProducts");
        if (title === "Skincare Essentials") return t("grid.skincareEssentials");
        if (title === "Signature Scent") return t("grid.signatureScent");
        if (title === "New Arrivals") return t("grid.newArrivals");
        return title;
    };

    return (
        <section className="relative py-10 md:py-16 px-4 md:px-8 w-full overflow-hidden">
            {backgroundImage && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={backgroundImage}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                    <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: overlayOpacity }}
                    />
                </div>
            )}

            {fadeEdges && (
                <>
                    <div
                        className="absolute top-0 left-0 right-0 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none"
                        style={{ height: `${fadePercentage}%` }}
                    />
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none"
                        style={{ height: `${fadePercentage}%` }}
                    />
                </>
            )}

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h2
                        className="text-2xl md:text-3xl font-serif font-semibold tracking-tight"
                        style={{ color: textColor }}
                    >
                        {getTranslatedTitle(content.title)}
                    </h2>
                    {layout !== 'featured' && (
                        <Link href="/products">
                            <Button
                                variant="ghost"
                                className="group text-sm font-medium"
                                style={{ color: textColor }}
                            >
                                {language === "bn" ? "সব দেখুন" : "View All"}
                                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Layout Rendering */}
                {layout === 'featured' ? (
                    <div className="w-full max-w-md mx-auto">
                        <FeaturedProductSlideshow products={displayProducts} onProductClick={handleProductClick} />
                    </div>
                ) : layout === 'carousel' ? (
                    <div
                        className="overflow-hidden -mx-4 px-4 md:mx-0 md:px-0"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => setIsPaused(false)}
                    >
                        <motion.div
                            className="flex gap-4 w-max"
                            animate={{ x: isPaused ? undefined : ["0%", "-50%"] }}
                            style={{ x: isPaused ? undefined : 0 }} // Keep position when paused? No, let's just pause animation
                            transition={{
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: 40, // Slow duration for "news headline" feel
                                    ease: "linear",
                                }
                            }}
                        >
                            {/* Duplicate products for seamless loop */}
                            {[...displayProducts, ...displayProducts].map((product, index) => (
                                <CarouselProductCard key={`${product.id}-${index}`} product={product} onProductClick={handleProductClick} />
                            ))}
                        </motion.div>
                    </div>
                ) : (
                    // Default Grid Layout
                    <div
                        className="grid gap-3 md:gap-5"
                        style={{
                            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                        }}
                    >
                        {displayProducts.map((product, index) => (
                            <GridProductCard
                                key={product.id}
                                product={product}
                                index={index}
                                onProductClick={handleProductClick}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {displayProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            {language === "bn" ? "কোন পণ্য নেই" : "No products found"}
                        </p>
                    </div>
                )}
            </div>

            <ProductDetailDialog
                product={selectedProduct}
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                onAddToCart={addToCart}
            />
        </section>
    );
}
