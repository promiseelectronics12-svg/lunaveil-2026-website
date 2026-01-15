
import { LayoutTemplate, ShoppingBag, ImageIcon, Type, Eye, GripVertical, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

const COMPONENT_TYPES = [
    { id: "hero", name: "Hero Section", icon: LayoutTemplate, description: "Full-width banner" },
    { id: "product_grid", name: "Product Grid", icon: ShoppingBag, description: "Collection display" },
    { id: "hot_deals", name: "Hot Deals", icon: Flame, description: "Featured hot products" },
    { id: "banner", name: "Banner Strip", icon: ImageIcon, description: "Announcement bar" },
    { id: "marquee", name: "Marquee", icon: Type, description: "Scrolling text" },
    { id: "shoppable_image", name: "Shoppable Image", icon: Eye, description: "Interactive lookbook" },
];

interface SidebarProps {
    onAddComponent: (type: string) => void;
}

export function Sidebar({ onAddComponent }: SidebarProps) {
    return (
        <div className="w-64 border-r bg-muted/10 flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Toolbox</h2>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {COMPONENT_TYPES.map((component) => (
                    <div
                        key={component.id}
                        className="group relative flex items-center gap-3 p-3 rounded-md border bg-card hover:border-primary hover:shadow-sm cursor-grab active:cursor-grabbing transition-all"
                        onClick={() => onAddComponent(component.id)}
                    >
                        <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <component.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-medium text-sm">{component.name}</div>
                            <div className="text-xs text-muted-foreground">{component.description}</div>
                        </div>
                        <GripVertical className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>
    );
}
