import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { useLanguage } from "@/lib/language-context";

interface MarqueeSectionProps {
    content: {
        text?: string;
        animation?: "scroll" | "scroll-reverse" | "bounce" | "fade" | "typewriter";
        speed?: "slow" | "normal" | "fast";
        styles?: {
            backgroundColor?: string;
            textColor?: string;
        };
    };
}

export function MarqueeSection({ content }: MarqueeSectionProps) {
    const { t } = useLanguage();

    // Construct default text with translations
    const defaultText = `${t("marquee.newArrivals")}  •  ${t("marquee.freeShipping")}  •  ${t("marquee.authentic")}  •  ${t("marquee.premiumQuality")}`;

    // Use content.text if provided, otherwise use the translated default text
    // Check if content.text matches the English default to replace it with dynamic translation
    const isDefaultText = content.text === "New Arrivals  •  Free Shipping on Orders Over ৳2000  •  100% Authentic  •  Premium Quality";
    const text = (content.text && !isDefaultText) ? content.text : defaultText;

    const styles = content.styles || {};
    const backgroundColor = styles.backgroundColor || "#1a1a1a";
    const textColor = styles.textColor || "#ffffff";
    const animation = content.animation || "scroll";
    const speed = content.speed || "normal";

    // Speed configuration
    const speedConfig = {
        slow: { duration: 35, typingDelay: 100 },
        normal: { duration: 20, typingDelay: 60 },
        fast: { duration: 10, typingDelay: 30 },
    };

    // Ensure speed is valid, otherwise default to normal
    const validSpeed = (content.speed && speedConfig[content.speed as keyof typeof speedConfig])
        ? content.speed as keyof typeof speedConfig
        : "normal";

    const { duration, typingDelay } = speedConfig[validSpeed];

    // For typewriter animation
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (animation !== "typewriter") return;

        let timeout: NodeJS.Timeout;

        if (!isDeleting && displayedText.length < text.length) {
            timeout = setTimeout(() => {
                setDisplayedText(text.slice(0, displayedText.length + 1));
            }, typingDelay);
        } else if (!isDeleting && displayedText.length === text.length) {
            timeout = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && displayedText.length > 0) {
            timeout = setTimeout(() => {
                setDisplayedText(text.slice(0, displayedText.length - 1));
            }, typingDelay / 2);
        } else if (isDeleting && displayedText.length === 0) {
            setIsDeleting(false);
        }

        return () => clearTimeout(timeout);
    }, [displayedText, isDeleting, text, animation, typingDelay]);

    // Duplicate text for seamless scroll loop
    const repeatedText = `${text}  •  ${text}  •  ${text}  •  ${text}  •  `;

    const renderContent = () => {
        switch (animation) {
            case "scroll":
                return (
                    <motion.div
                        className="whitespace-nowrap flex"
                        animate={{ x: [0, -1000] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: duration,
                                ease: "linear",
                            },
                        }}
                    >
                        <span className="text-sm font-medium tracking-wide" style={{ color: textColor }}>
                            {repeatedText}
                        </span>
                        <span className="text-sm font-medium tracking-wide" style={{ color: textColor }}>
                            {repeatedText}
                        </span>
                    </motion.div>
                );

            case "scroll-reverse":
                return (
                    <motion.div
                        className="whitespace-nowrap flex"
                        animate={{ x: [-1000, 0] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: duration,
                                ease: "linear",
                            },
                        }}
                    >
                        <span className="text-sm font-medium tracking-wide" style={{ color: textColor }}>
                            {repeatedText}
                        </span>
                        <span className="text-sm font-medium tracking-wide" style={{ color: textColor }}>
                            {repeatedText}
                        </span>
                    </motion.div>
                );

            case "bounce":
                return (
                    <motion.div
                        className="text-center"
                        animate={{ x: [-100, 100, -100] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                duration: duration / 2,
                                ease: "easeInOut",
                            },
                        }}
                    >
                        <span className="text-sm font-medium tracking-wide" style={{ color: textColor }}>
                            {text}
                        </span>
                    </motion.div>
                );

            case "fade":
                return (
                    <motion.div
                        className="text-center"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                            opacity: {
                                repeat: Infinity,
                                duration: duration / 4,
                                ease: "easeInOut",
                            },
                        }}
                    >
                        <span className="text-sm font-medium tracking-wide" style={{ color: textColor }}>
                            {text}
                        </span>
                    </motion.div>
                );

            case "typewriter":
                return (
                    <div className="text-center">
                        <span className="text-sm font-medium tracking-wide" style={{ color: textColor }}>
                            {displayedText}
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="ml-0.5"
                            >
                                |
                            </motion.span>
                        </span>
                    </div>
                );

            default:
                return (
                    <div className="text-center">
                        <span className="text-sm font-medium tracking-wide" style={{ color: textColor }}>
                            {text}
                        </span>
                    </div>
                );
        }
    };

    return (
        <div
            className="w-full overflow-hidden py-2.5"
            style={{ backgroundColor }}
        >
            {renderContent()}
        </div>
    );
}
