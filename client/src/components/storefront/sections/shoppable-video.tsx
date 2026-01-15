import { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
const Player = ReactPlayer as unknown as React.ComponentType<any>;
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";

interface ShoppableVideoProps {
    content: {
        videoUrl: string;
        title?: string;
        subtitle?: string;
        productIds?: string[];
        overlayPosition?: "left" | "right";
    };
}

export function ShoppableVideoSection({ content }: ShoppableVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showProducts, setShowProducts] = useState(true);
    const { addToCart } = useCart();
    const { toast } = useToast();
    const { language, t } = useLanguage();

    // Fetch products linked to this video
    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ["/api/products", { ids: content.productIds }],
        queryFn: async () => {
            if (!content.productIds || content.productIds.length === 0) return [];
            // In a real app, we'd have a bulk fetch endpoint or filter client-side
            // For now, let's just fetch all and filter (mock implementation)
            const allProducts = await apiRequest("GET", "/api/products") as Product[];
            return allProducts.filter((p: Product) => content.productIds?.includes(p.id));
        },
        enabled: !!content.productIds && content.productIds.length > 0,
    });

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleAddToCart = (product: Product) => {
        addToCart(product, true);
        const productName = language === "bn" ? product.nameBn : product.nameEn;
        toast({
            title: t("common.addedToCart"),
            description: `${productName} ${language === "bn" ? "কার্টে যোগ করা হয়েছে" : "has been added to your cart."}`,
        });
    };

    return (
        <section className="w-full py-12 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Video Container */}
                    <div className="relative aspect-[9/16] md:aspect-video lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl group">
                        {!content.videoUrl ? (
                            <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground">
                                <p>No video URL provided</p>
                            </div>
                        ) : (
                            <>
                                <div className="relative w-full h-full">
                                    {/* React Player for ALL video types */}
                                    <Player
                                        url={content.videoUrl}
                                        width="100%"
                                        height="100%"
                                        playing={true}
                                        muted={isMuted}
                                        loop={true}
                                        playsinline={true}
                                        controls={false}
                                        onStart={() => setIsPlaying(true)}
                                        config={{
                                            youtube: {
                                                playerVars: { modestbranding: 1, rel: 0 }
                                            },
                                            file: {
                                                attributes: {
                                                    preload: 'auto',
                                                    style: { objectFit: 'cover', width: '100%', height: '100%' }
                                                }
                                            }
                                        } as any}
                                        className="absolute inset-0 object-cover"
                                    />

                                    {/* Cover Image Overlay (Only for YouTube, fades out when playing) */}
                                    {(content.videoUrl.includes("youtube.com") || content.videoUrl.includes("youtu.be")) && (
                                        <div
                                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                                            style={{
                                                backgroundImage: `url(https://img.youtube.com/vi/${content.videoUrl.split('v=')[1]?.split('&')[0] || content.videoUrl.split('/').pop()}/maxresdefault.jpg)`,
                                                zIndex: 10
                                            }}
                                        />
                                    )}

                                    {/* Unmute Button Overlay */}
                                    <div className="absolute bottom-4 right-4 z-20">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="rounded-full bg-black/40 hover:bg-black/60 text-white border-none backdrop-blur-sm"
                                            onClick={() => setIsMuted(!isMuted)}
                                        >
                                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Content & Products */}
                    <div className="flex flex-col gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                </span>
                                {t("shoppable.shopTheLook")}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                                {content.title === "Get the Glow"
                                    ? t("shoppable.getTheGlowTitle")
                                    : (content.title || t("shoppable.getTheLook"))}
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                {content.subtitle && content.subtitle.startsWith("Watch how to achieve")
                                    ? t("shoppable.getTheGlowSubtitle")
                                    : (content.subtitle || t("shoppable.featuredProducts"))}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-4 p-3 rounded-xl border bg-card hover:shadow-md transition-shadow"
                                >
                                    <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        {product.images && product.images[0] && (
                                            <img
                                                src={product.images[0]}
                                                alt={language === "bn" ? product.nameBn : product.nameEn}
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{language === "bn" ? product.nameBn : product.nameEn}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{product.category}</p>
                                        <div className="mt-1 font-semibold">৳{product.discountedPrice || product.price}</div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAddToCart(product)}
                                        className="shrink-0"
                                    >
                                        {t("shoppable.add")} <ShoppingBag className="ml-2 h-4 w-4" />
                                    </Button>
                                </motion.div>
                            ))}

                            {products.length === 0 && (
                                <div className="p-8 text-center border rounded-xl border-dashed text-muted-foreground">
                                    {t("shoppable.noProducts")}
                                </div>
                            )}
                        </div>

                        <Button variant="link" className="w-fit p-0 h-auto font-semibold group">
                            {t("shoppable.viewAll")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </section >
    );
}
