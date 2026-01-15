import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Reorder, useDragControls } from "framer-motion";
import { Plus, GripVertical, Trash2, Save, Eye, LayoutTemplate, Image as ImageIcon, ShoppingBag, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { StorefrontSection } from "@shared/schema";

// Section Types Definition
const SECTION_TYPES = [
    { id: "hero", name: "Cinematic Hero", icon: LayoutTemplate, description: "Full-screen video/image with text overlay" },
    { id: "product_grid", name: "Product Grid", icon: ShoppingBag, description: "Grid of products from a collection" },
    { id: "banner", name: "Banner Strip", icon: ImageIcon, description: "Wide banner for announcements" },
    { id: "marquee", name: "Marquee Scroll", icon: Type, description: "Scrolling text or logos" },
    { id: "shoppable_image", name: "Shoppable Lookbook", icon: Eye, description: "Image with interactive product hotspots" },
];

export default function AdminBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [sections, setSections] = useState<StorefrontSection[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const { data: fetchedSections, isLoading, error } = useQuery<StorefrontSection[]>({
        queryKey: ["/api/storefront-sections"],
        queryFn: () => apiRequest("GET", "/api/storefront-sections"),
    });

    useEffect(() => {
        console.log('AdminBuilder: fetchedSections updated:', fetchedSections);
        if (fetchedSections) {
            setSections(fetchedSections);
        }
    }, [fetchedSections]);

    console.log('AdminBuilder: current sections state:', sections);
    console.log('AdminBuilder: current sections state:', sections);

    useEffect(() => {
        if (error) {
            console.error('AdminBuilder: query error:', error);
            toast({ title: "Error", description: "Failed to load sections", variant: "destructive" });
        }
    }, [error, toast]);

    const createMutation = useMutation({
        mutationFn: async (type: string) => {
            const defaultContent = getDefaultContent(type);
            const newOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 0;
            await apiRequest("POST", "/api/storefront-sections", {
                type,
                order: newOrder,
                content: defaultContent,
                isActive: true,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/storefront-sections"] });
            setIsAddDialogOpen(false);
            toast({ title: "Success", description: "Section added successfully" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await apiRequest("PATCH", `/api/storefront-sections/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/storefront-sections"] });
            toast({ title: "Saved", description: "Changes saved successfully" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/storefront-sections/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/storefront-sections"] });
            toast({ title: "Deleted", description: "Section removed" });
        },
    });

    const handleReorder = (newOrder: StorefrontSection[]) => {
        setSections(newOrder);
        // In a real app, we would debounce this and save the new order to the backend
        // For now, let's just update the local state and maybe trigger a save button
    };

    const saveOrder = async () => {
        try {
            await Promise.all(sections.map((section, index) =>
                apiRequest("PATCH", `/api/storefront-sections/${section.id}`, { order: index })
            ));
            queryClient.invalidateQueries({ queryKey: ["/api/storefront-sections"] });
            toast({ title: "Success", description: "Order saved successfully" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save order", variant: "destructive" });
        }
    };

    const getDefaultContent = (type: string) => {
        switch (type) {
            case "hero":
                return { title: "New Hero", subtitle: "Subtitle here", image: "", ctaText: "Shop Now", ctaLink: "/products" };
            case "product_grid":
                return { title: "Featured Products", collectionId: "", limit: 4 };
            case "banner":
                return { text: "Free Shipping on Orders Over $50", link: "/shipping" };
            case "marquee":
                return { items: ["Cruelty Free", "Vegan", "Organic", "Sustainable"] };
            case "shoppable_image":
                return { image: "", hotspots: [] };
            default:
                return {};
        }
    };

    // if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        Page Builder
                        {isLoading && <span className="text-sm font-normal text-muted-foreground">(Loading...)</span>}
                    </h1>
                    <p className="text-muted-foreground">Manage your storefront layout and content</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={saveOrder}>
                        <Save className="mr-2 h-4 w-4" /> Save Order
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Section
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Choose Section Type</DialogTitle>
                                <DialogDescription>
                                    Select a section type to add to your storefront.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 gap-4 mt-4">
                                {SECTION_TYPES.map((type) => (
                                    <Button
                                        key={type.id}
                                        variant="outline"
                                        className="h-auto p-4 justify-start"
                                        onClick={() => createMutation.mutate(type.id)}
                                    >
                                        <type.icon className="mr-4 h-8 w-8 text-primary" />
                                        <div className="text-left">
                                            <div className="font-semibold">{type.name}</div>
                                            <div className="text-xs text-muted-foreground">{type.description}</div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="space-y-4">
                {sections.map((section) => (
                    <Reorder.Item key={section.id} value={section}>
                        <SectionCard
                            section={section}
                            onUpdate={(data) => updateMutation.mutate({ id: section.id, data })}
                            onDelete={() => deleteMutation.mutate(section.id)}
                        />
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {sections.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No sections yet. Add one to get started!</p>
                </div>
            )}
        </div>
    );
}

function SectionCard({ section, onUpdate, onDelete }: { section: StorefrontSection, onUpdate: (data: any) => void, onDelete: () => void }) {
    const typeInfo = SECTION_TYPES.find(t => t.id === section.type) || { name: section.type, icon: LayoutTemplate };
    const [content, setContent] = useState(() => {
        if (typeof section.content === 'string') {
            try {
                return JSON.parse(section.content);
            } catch (e) {
                console.error("Failed to parse section content:", e);
                return {};
            }
        }
        return section.content || {};
    });

    const handleContentChange = (key: string, value: any) => {
        const newContent = { ...content, [key]: value };
        setContent(newContent);
    };

    const handleSave = () => {
        onUpdate({ content });
    };

    return (
        <Card>
            <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0">
                <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                    <typeInfo.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{typeInfo.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Switch
                        checked={section.isActive || false}
                        onCheckedChange={(checked) => onUpdate({ isActive: checked })}
                    />
                    <Button variant="ghost" size="icon" onClick={onDelete}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Accordion type="single" collapsible>
                    <AccordionItem value="edit" className="border-none">
                        <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
                            Edit Content
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 pt-4 border-t">
                                {section.type === "hero" && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label>Title</Label>
                                            <Input value={content.title || ""} onChange={e => handleContentChange("title", e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Subtitle</Label>
                                            <Input value={content.subtitle || ""} onChange={e => handleContentChange("subtitle", e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Image/Video URL</Label>
                                            <Input value={content.image || ""} onChange={e => handleContentChange("image", e.target.value)} />
                                        </div>
                                    </>
                                )}
                                {section.type === "product_grid" && (
                                    <div className="grid gap-2">
                                        <Label>Title</Label>
                                        <Input value={content.title || ""} onChange={e => handleContentChange("title", e.target.value)} />
                                        {/* Collection selector would go here */}
                                    </div>
                                )}
                                {section.type === "banner" && (
                                    <div className="grid gap-2">
                                        <Label>Text</Label>
                                        <Input value={content.text || ""} onChange={e => handleContentChange("text", e.target.value)} />
                                    </div>
                                )}
                                <Button size="sm" onClick={handleSave}>Save Content</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
