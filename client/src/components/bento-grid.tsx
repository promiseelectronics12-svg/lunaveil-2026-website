import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export interface BentoItem {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    image?: string;
    cta?: string;
    ctaLink?: string;
    className?: string; // For col-span/row-span
    variant?: "default" | "dark" | "light";
}

interface BentoGridProps {
    items: BentoItem[];
}

export function BentoGrid({ items }: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(200px,auto)]">
            {items.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={cn(
                        "group relative overflow-hidden rounded-xl bg-card border hover-elevate transition-all duration-300",
                        item.className,
                        item.variant === "dark" && "bg-primary text-primary-foreground",
                        item.variant === "light" && "bg-secondary text-secondary-foreground"
                    )}
                >
                    {/* Background Image */}
                    {item.image && (
                        <div className="absolute inset-0 z-0">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                        {item.subtitle && (
                            <span className="text-xs font-medium uppercase tracking-wider mb-2 opacity-80">
                                {item.subtitle}
                            </span>
                        )}
                        <h3 className="text-2xl font-serif font-bold mb-2 leading-tight">
                            {item.title}
                        </h3>
                        {item.description && (
                            <p className="text-sm opacity-90 mb-4 max-w-sm">
                                {item.description}
                            </p>
                        )}
                        {item.cta && (
                            <Button
                                variant={item.variant === "dark" || item.image ? "secondary" : "default"}
                                size="sm"
                                className="w-fit gap-2"
                                asChild
                            >
                                <a href={item.ctaLink || "#"}>
                                    {item.cta}
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
