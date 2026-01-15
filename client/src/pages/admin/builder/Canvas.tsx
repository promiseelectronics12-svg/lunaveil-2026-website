
import { StorefrontSection } from "@shared/schema";
import { HeroSection } from "@/components/storefront/sections/hero";
import { ProductGridSection } from "@/components/storefront/sections/product-grid";
import { BannerSection } from "@/components/storefront/sections/banner";
import { MarqueeSection } from "@/components/storefront/sections/marquee";
import { ShoppableImageSection } from "@/components/storefront/sections/shoppable-image";
import { cn } from "@/lib/utils";
import { Reorder, useDragControls } from "framer-motion";
import { GripHorizontal, GripVertical } from "lucide-react";
import React, { useState, useEffect } from "react";

interface CanvasProps {
    sections: StorefrontSection[];
    deviceMode: "desktop" | "mobile";
    selectedSectionId: string | null;
    onSelectSection: (id: string) => void;
    onReorder: (newOrder: StorefrontSection[]) => void;
    onUpdate: (id: string, updates: Partial<StorefrontSection>) => void;
}

interface SortableSectionProps {
    section: StorefrontSection;
    isSelected: boolean;
    deviceMode: "desktop" | "mobile";
    onSelect: () => void;
    onResizeStart: (e: React.MouseEvent, section: StorefrontSection) => void;
}

function SortableSection({ section, isSelected, deviceMode, onSelect, onResizeStart }: SortableSectionProps) {
    const dragControls = useDragControls();
    const content = typeof section.content === 'string'
        ? JSON.parse(section.content)
        : section.content || {};

    return (
        <Reorder.Item
            value={section}
            as="div"
            dragListener={false}
            dragControls={dragControls}
            className={cn(
                "reorder-item relative group cursor-pointer border-2 border-transparent hover:border-primary/50 transition-colors mb-2",
                isSelected && "border-primary ring-2 ring-primary/20 z-10"
            )}
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            {/* Drag Handle - Visible on Hover, Selected, or Mobile */}
            <div
                className={cn(
                    "absolute top-2 left-1/2 -translate-x-1/2 z-50 p-1.5 cursor-grab active:cursor-grabbing bg-white/90 shadow-sm rounded-md border transition-opacity",
                    // On desktop: hidden by default, shown on hover or selection
                    // On mobile: always visible
                    deviceMode === "desktop" && !isSelected ? "opacity-0 group-hover:opacity-100" : "opacity-100",
                    isSelected && "bg-primary text-primary-foreground border-primary"
                )}
                style={{ touchAction: "none" }}
                onPointerDown={(e) => dragControls.start(e)}
            >
                <GripHorizontal className="w-5 h-5" />
            </div>

            {/* Overlay to intercept clicks for selection */}
            <div className="absolute inset-0 z-10 bg-transparent" />

            {/* Render the actual section */}
            <div className="pointer-events-none select-none">
                {section.type === "hero" && <HeroSection content={content} />}
                {section.type === "product_grid" && <ProductGridSection content={content} />}
                {section.type === "banner" && <BannerSection content={content} />}
                {section.type === "marquee" && <MarqueeSection content={content} />}
                {section.type === "shoppable_image" && <ShoppableImageSection content={content} />}
            </div>

            {/* Selection Label */}
            {isSelected && (
                <div className="absolute top-2 right-2 z-20 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-sm pointer-events-none">
                    Selected
                </div>
            )}

            {/* Resize Handle (Only for Hero currently, or any resizable section) */}
            {isSelected && section.type === "hero" && (
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 bg-primary text-primary-foreground rounded-full p-1 cursor-ns-resize shadow-md hover:scale-110 transition-transform"
                    onMouseDown={(e) => onResizeStart(e, section)}
                >
                    <GripHorizontal className="h-4 w-4" />
                </div>
            )}
        </Reorder.Item>
    );
}

export function Canvas({
    sections,
    deviceMode,
    selectedSectionId,
    onSelectSection,
    onReorder,
    onUpdate
}: CanvasProps) {

    const [isResizing, setIsResizing] = useState(false);
    const [resizeStartY, setResizeStartY] = useState(0);
    const [resizeStartHeight, setResizeStartHeight] = useState(0);
    const [resizingSectionId, setResizingSectionId] = useState<string | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !resizingSectionId) return;

            const deltaY = e.clientY - resizeStartY;
            const newHeight = Math.max(100, resizeStartHeight + deltaY); // Min height 100px

            // Find the section to get its current content
            const section = sections.find(s => s.id === resizingSectionId);
            if (section) {
                const content = typeof section.content === 'string'
                    ? JSON.parse(section.content)
                    : section.content || {};

                onUpdate(resizingSectionId, {
                    content: {
                        ...content,
                        styles: {
                            ...content.styles,
                            height: `${newHeight}px`
                        }
                    }
                });
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            setResizingSectionId(null);
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, resizeStartY, resizeStartHeight, resizingSectionId, sections, onUpdate]);

    const handleResizeStart = (e: React.MouseEvent, section: StorefrontSection) => {
        e.stopPropagation();
        e.preventDefault();

        const element = (e.target as HTMLElement).closest('.reorder-item');
        const currentHeight = element ? element.clientHeight : 400;

        setIsResizing(true);
        setResizeStartY(e.clientY);
        setResizeStartHeight(currentHeight);
        setResizingSectionId(section.id);
    };

    return (
        <div className="flex-1 bg-muted/20 overflow-y-auto p-8 flex justify-center">
            <div
                className={cn(
                    "bg-background shadow-2xl transition-all duration-300 ease-in-out relative",
                    deviceMode === "mobile"
                        ? "w-[375px] h-[667px] rounded-[2rem] border-[8px] border-gray-800 overflow-y-auto overflow-x-hidden"
                        : "w-full max-w-screen-xl min-h-screen rounded-md border"
                )}
            >
                {/* Device Header (Mobile Only) */}
                {deviceMode === "mobile" && (
                    <div className="h-6 bg-gray-800 w-full sticky top-0 left-0 z-50 flex justify-center items-center">
                        <div className="w-20 h-4 bg-black rounded-b-xl"></div>
                    </div>
                )}

                <div className={cn("w-full bg-background", deviceMode === "mobile" && "pb-6")}>
                    <Reorder.Group axis="y" as="div" values={sections} onReorder={onReorder} className="min-h-full p-1">
                        {sections.map((section) => (
                            <SortableSection
                                key={section.id}
                                section={section}
                                isSelected={selectedSectionId === section.id}
                                deviceMode={deviceMode}
                                onSelect={() => onSelectSection(section.id)}
                                onResizeStart={handleResizeStart}
                            />
                        ))}

                        {sections.length === 0 && (
                            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed m-8 rounded-lg">
                                <p>Drag components here from the toolbox</p>
                            </div>
                        )}
                    </Reorder.Group>
                </div>
            </div>
        </div>
    );
}
