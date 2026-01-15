import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect, useId } from "react";
import { useLanguage } from "@/lib/language-context";

interface HeroSectionProps {
    content: {
        title?: string;
        subtitle?: string;
        image?: string;
        images?: string[];
        ctaText?: string;
        ctaLink?: string;
        styles?: {
            height?: string;
            textAlign?: string;
            padding?: string;
            overlayOpacity?: number;
            textColor?: string;
            // New properties
            variant?: "overlay" | "split" | "minimal";
            imagePosition?: "left" | "right";
            backgroundColor?: string;
            buttonSize?: "small" | "medium" | "large";
            buttonAlignment?: "left" | "center" | "right";
            imageFit?: "cover" | "contain";
            imageRadius?: "none" | "small" | "medium" | "large";
            transition?: "fade" | "slide" | "zoom";
        };
    };
}


// ... (imports)

export function HeroSection({ content }: HeroSectionProps) {
    const { t } = useLanguage();
    const uniqueId = useId().replace(/:/g, ""); // Clean ID for CSS selector
    const heroId = `hero-${uniqueId}`;

    const displayTitle = content.title === "Redefine Your Beauty"
        ? t("hero.redefineTitle")
        : (content.title || "Welcome to LunaVeil");

    const displaySubtitle = content.subtitle && content.subtitle.startsWith("Experience the ultimate collection")
        ? t("hero.redefineSubtitle")
        : (content.subtitle || "Discover our premium collection");

    const styles = content.styles || {};
    const height = styles.height || "80vh";
    const textAlign = styles.textAlign || "center";
    const padding = styles.padding === "small" ? "p-4" : styles.padding === "large" ? "p-12" : "p-6";
    const overlayOpacity = (styles.overlayOpacity ?? 30) / 100;
    const textColor = styles.textColor || "#ffffff";
    const variant = styles.variant || "overlay";
    const imagePosition = styles.imagePosition || "left";

    // New style accessors
    const buttonSize = styles.buttonSize || "medium";
    const buttonAlignment = styles.buttonAlignment || textAlign; // Default to text alignment
    const imageFit = styles.imageFit || "cover";
    const imageRadius = styles.imageRadius || "none";
    const transitionType = styles.transition || "fade";

    const getButtonStyles = () => {
        switch (buttonSize) {
            case "small":
                return {
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem"
                };
            case "large":
                return {
                    padding: "1rem 2.5rem",
                    fontSize: "1.25rem"
                };
            default: // medium
                return {
                    padding: "0.75rem 1.5rem",
                    fontSize: "1rem"
                };
        }
    };

    const getImageRadiusClass = () => {
        switch (imageRadius) {
            case "small": return "rounded-lg";
            case "medium": return "rounded-xl";
            case "large": return "rounded-3xl";
            default: return "rounded-none";
        }
    };

    // Common Content Component
    const HeroContent = () => (
        <div className="w-full max-w-4xl mx-auto px-4 flex flex-col" style={{ alignItems: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center" }}>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="font-bold tracking-tight mb-4 leading-tight"
                style={{
                    color: textColor,
                    fontSize: "clamp(1.75rem, 5vw + 1rem, 6rem)",
                    textAlign: textAlign as any
                }}
            >
                {displayTitle}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="mb-8 max-w-2xl opacity-90 leading-relaxed"
                style={{
                    color: textColor,
                    fontSize: "clamp(0.875rem, 1.5vw + 0.5rem, 1.5rem)",
                    textAlign: textAlign as any
                }}
            >
                {displaySubtitle}
            </motion.p>

            {content.ctaText && content.ctaLink && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="w-full flex"
                    style={{
                        justifyContent: buttonAlignment === "left" ? "flex-start" : buttonAlignment === "right" ? "flex-end" : "center"
                    }}
                >
                    <Link href={content.ctaLink}>
                        <Button
                            size="lg"
                            className="rounded-full bg-white text-black hover:bg-white/90 transition-all hover:scale-105"
                            style={getButtonStyles()}
                        >
                            {content.ctaText}
                        </Button>
                    </Link>
                </motion.div>
            )}
        </div>
    );

    // Slideshow Logic
    const images = content.images || [content.image || ""];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(interval);
    }, [images.length]);

    // Split View Layout
    if (variant === "split") {
        return (
            <>
                <style>{`
                    #${heroId} {
                        height: auto;
                        min-height: 100vh;
                    }
                    @media (min-width: 768px) {
                        #${heroId} {
                            height: ${height};
                            min-height: 400px;
                        }
                    }
                `}</style>
                <div
                    id={heroId}
                    className="relative w-full overflow-hidden flex flex-col md:flex-row"
                    style={{
                        backgroundColor: styles.backgroundColor || "#ffffff"
                    }}
                >
                    {/* Image Side */}
                    <div className={`w-full md:w-1/2 h-[50vh] md:h-full relative p-4 ${imagePosition === "right" ? "md:order-2" : ""}`}>
                        <div className={`h-full w-full overflow-hidden relative ${getImageRadiusClass()}`}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={
                                        transitionType === "slide" ? { x: "100%" } :
                                            transitionType === "zoom" ? { scale: 1.1, opacity: 0 } :
                                                { opacity: 0 }
                                    }
                                    animate={
                                        transitionType === "slide" ? { x: 0 } :
                                            transitionType === "zoom" ? { scale: 1, opacity: 1 } :
                                                { opacity: 1 }
                                    }
                                    exit={
                                        transitionType === "slide" ? { x: "-100%" } :
                                            transitionType === "zoom" ? { opacity: 0 } :
                                                { opacity: 0 }
                                    }
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="absolute inset-0"
                                >
                                    {images[currentImageIndex] ? (
                                        <img
                                            src={images[currentImageIndex]}
                                            alt={content.title || "Hero"}
                                            className="h-full w-full"
                                            style={{
                                                objectFit: imageFit,
                                                objectPosition: "center"
                                            }}
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-muted/20" />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div
                        className={`w-full md:w-1/2 h-auto md:h-full flex flex-col justify-center ${padding} py-12 md:py-0`}
                        style={{
                            color: textColor
                        }}
                    >
                        <HeroContent />
                    </div>
                </div>
            </>
        );
    }

    // Default Overlay Layout
    return (
        <div
            className="relative w-full overflow-hidden"
            style={{ height, minHeight: "400px" }}
        >
            {/* Background Image/Video Slideshow */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentImageIndex}
                    initial={
                        transitionType === "slide" ? { x: "100%" } :
                            transitionType === "zoom" ? { scale: 1.1, opacity: 0 } :
                                { opacity: 0 }
                    }
                    animate={
                        transitionType === "slide" ? { x: 0 } :
                            transitionType === "zoom" ? { scale: 1, opacity: 1 } :
                                { opacity: 1 }
                    }
                    exit={
                        transitionType === "slide" ? { x: "-100%" } :
                            transitionType === "zoom" ? { opacity: 0 } :
                                { opacity: 0 }
                    }
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {images[currentImageIndex] ? (
                        <img
                            src={images[currentImageIndex]}
                            alt={content.title || "Hero"}
                            className="h-full w-full object-cover"
                            style={{ objectPosition: "center" }}
                        />
                    ) : (
                        <div className="h-full w-full bg-muted/20" />
                    )}
                    <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: overlayOpacity }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Content Overlay */}
            <div
                className={`absolute inset-0 flex flex-col justify-center ${padding} z-10`}
                style={{
                    alignItems: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
                    textAlign: textAlign as any,
                    color: textColor
                }}
            >
                <HeroContent />
            </div>

            {/* Slideshow Indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                                ? "bg-white w-6"
                                : "bg-white/50 hover:bg-white/80"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
