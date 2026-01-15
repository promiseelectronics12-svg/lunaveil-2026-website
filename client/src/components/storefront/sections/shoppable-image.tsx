import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Link } from "wouter";

interface Hotspot {
    id: string;
    x: number; // Percentage
    y: number; // Percentage
    productId?: string;
    productName?: string;
    price?: string;
}

interface ShoppableImageSectionProps {
    content: {
        image?: string;
        hotspots?: Hotspot[];
    };
}

export function ShoppableImageSection({ content }: ShoppableImageSectionProps) {
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

    // Mock hotspots if none provided
    const hotspots = content.hotspots || [
        { id: "1", x: 30, y: 40, productName: "Silk Serum", price: "$45.00", productId: "1" },
        { id: "2", x: 60, y: 70, productName: "Night Cream", price: "$60.00", productId: "2" },
    ];

    return (
        <section className="relative w-full h-[600px] bg-gray-100 overflow-hidden">
            {content.image ? (
                <img
                    src={content.image}
                    alt="Shoppable Lookbook"
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Shoppable Image Placeholder
                </div>
            )}

            {hotspots.map((hotspot) => (
                <div
                    key={hotspot.id}
                    className="absolute"
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                >
                    <button
                        className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-lg hover:scale-110 transition-transform"
                        onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
                    >
                        <Plus className={`w-4 h-4 transition-transform ${activeHotspot === hotspot.id ? "rotate-45" : ""}`} />
                        <span className="absolute w-full h-full rounded-full animate-ping bg-white/50" />
                    </button>

                    <AnimatePresence>
                        {activeHotspot === hotspot.id && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className="absolute top-10 left-1/2 -translate-x-1/2 w-48 bg-white p-3 rounded-lg shadow-xl z-10"
                            >
                                <div className="text-sm font-medium">{hotspot.productName}</div>
                                <div className="text-sm text-muted-foreground mb-2">{hotspot.price}</div>
                                <Link href={`/products/${hotspot.productId}`}>
                                    <span className="text-xs font-semibold text-primary hover:underline cursor-pointer">View Product</span>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </section>
    );
}
