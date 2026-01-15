import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Type, Sparkles, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reorder, useDragControls } from "framer-motion";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { StorefrontSection } from "@shared/schema";

const SECTION_TYPES = [
    { id: "marquee", name: "Announcement Bar", icon: Type, description: "Scrolling text banner at top" },
    { id: "hero", name: "Hero Section", icon: Image, description: "Full-width hero with image/text" },
    { id: "product_grid", name: "Product Grid", icon: Sparkles, description: "Display products in a grid" },
    { id: "banner", name: "Promo Banner", icon: Image, description: "Image banner with link" },
    { id: "shoppable_video", name: "Shoppable Video", icon: Image, description: "Video with shoppable products" },
];

const MARQUEE_ANIMATIONS = [
    { id: "scroll", name: "Scroll Left", description: "Classic scrolling text" },
    { id: "scroll-reverse", name: "Scroll Right", description: "Reverse scrolling" },
    { id: "bounce", name: "Bounce", description: "Text bounces left to right" },
    { id: "fade", name: "Fade In/Out", description: "Static text that fades" },
    { id: "typewriter", name: "Typewriter", description: "Text types out character by character" },
];

interface SortableSectionItemProps {
    section: StorefrontSection;
    onEdit: (section: StorefrontSection) => void;
    onDelete: (id: string) => void;
    onToggleActive: (id: string, isActive: boolean) => void;
}

function SortableSectionItem({ section, onEdit, onDelete, onToggleActive }: SortableSectionItemProps) {
    const dragControls = useDragControls();
    const Icon = SECTION_TYPES.find(t => t.id === section.type)?.icon || Type;
    const content = typeof section.content === 'string'
        ? JSON.parse(section.content)
        : section.content;

    const getSectionName = (type: string) => {
        const sectionType = SECTION_TYPES.find(t => t.id === type);
        return sectionType?.name || type;
    };

    return (
        <Reorder.Item
            value={section}
            dragListener={false}
            dragControls={dragControls}
            className={`flex items-center gap-3 p-3 rounded-lg border bg-card mb-2 ${!section.isActive ? 'opacity-50' : ''}`}
        >
            <div
                className="cursor-grab active:cursor-grabbing p-1 touch-none"
                onPointerDown={(e) => dragControls.start(e)}
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-2 rounded-md bg-muted">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium">{getSectionName(section.type)}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {section.type === "marquee" && content.text}
                        {section.type === "hero" && content.title}
                        {section.type === "product_grid" && content.title}
                        {section.type === "banner" && content.title}
                    </p>
                </div>
            </div>

            <span className="text-xs bg-muted px-2 py-1 rounded">
                Order: {section.order}
            </span>

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onToggleActive(section.id, !section.isActive)}
                >
                    {section.isActive ? (
                        <Eye className="h-4 w-4" />
                    ) : (
                        <EyeOff className="h-4 w-4" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(section)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onDelete(section.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </Reorder.Item>
    );
}

export default function PageBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<StorefrontSection | null>(null);
    const [newSectionType, setNewSectionType] = useState<string>("");
    const [localSections, setLocalSections] = useState<StorefrontSection[]>([]);

    // Form state for marquee
    const [marqueeText, setMarqueeText] = useState("");
    const [marqueeAnimation, setMarqueeAnimation] = useState("scroll");
    const [marqueeSpeed, setMarqueeSpeed] = useState("normal");
    const [marqueeBgColor, setMarqueeBgColor] = useState("#1a1a1a");
    const [marqueeTextColor, setMarqueeTextColor] = useState("#ffffff");

    // Form state for shoppable video
    const [videoTitle, setVideoTitle] = useState("");
    const [videoSubtitle, setVideoSubtitle] = useState("");
    const [videoUrl, setVideoUrl] = useState("");

    // Form state for banner
    const [bannerText, setBannerText] = useState("");
    const [bannerLink, setBannerLink] = useState("");
    const [bannerBgColor, setBannerBgColor] = useState("#000000");
    const [bannerTextColor, setBannerTextColor] = useState("#ffffff");
    const [bannerUsePromotion, setBannerUsePromotion] = useState(false);

    // Form state for hero
    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [heroImages, setHeroImages] = useState(""); // Newline separated URLs
    const [heroCtaText, setHeroCtaText] = useState("");
    const [heroCtaLink, setHeroCtaLink] = useState("");
    const [heroHeight, setHeroHeight] = useState("80vh");
    const [heroOverlayOpacity, setHeroOverlayOpacity] = useState(30);
    const [heroTextColor, setHeroTextColor] = useState("#ffffff");
    const [heroTransition, setHeroTransition] = useState("fade");

    const [sectionOrder, setSectionOrder] = useState(0);
    const [sectionActive, setSectionActive] = useState(true);

    const { data: sections = [], isLoading } = useQuery<StorefrontSection[]>({
        queryKey: ["/api/storefront-sections"],
    });

    useEffect(() => {
        if (sections.length > 0) {
            setLocalSections([...sections].sort((a, b) => a.order - b.order));
        }
    }, [sections]);

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/storefront-sections", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/storefront-sections"] });
            setIsDialogOpen(false);
            resetForm();
            toast({ title: "Success", description: "Section created successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await apiRequest("PATCH", `/api/storefront-sections/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/storefront-sections"] });
            setIsDialogOpen(false);
            setEditingSection(null);
            resetForm();
            toast({ title: "Success", description: "Section updated successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/storefront-sections/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/storefront-sections"] });
            toast({ title: "Success", description: "Section deleted successfully" });
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            await apiRequest("PATCH", `/api/storefront-sections/${id}`, { isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/storefront-sections"] });
        },
    });

    const saveOrderMutation = useMutation({
        mutationFn: async (orderedSections: StorefrontSection[]) => {
            await Promise.all(orderedSections.map((section, index) =>
                apiRequest("PATCH", `/api/storefront-sections/${section.id}`, { order: index })
            ));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/storefront-sections"] });
            toast({ title: "Saved", description: "Order updated successfully" });
        }
    });

    const handleReorder = (newOrder: StorefrontSection[]) => {
        setLocalSections(newOrder);
        // Debounce or save immediately? Let's save immediately for simplicity, 
        // but ideally we should debounce or have a save button.
        // For better UX, we'll just fire it.
        saveOrderMutation.mutate(newOrder);
    };

    const resetForm = () => {
        setMarqueeText("");
        setMarqueeAnimation("scroll");
        setMarqueeSpeed("normal");
        setMarqueeBgColor("#1a1a1a");
        setMarqueeTextColor("#ffffff");
        setVideoTitle("");
        setVideoSubtitle("");
        setVideoUrl("");
        setBannerText("");
        setBannerLink("");
        setBannerBgColor("#000000");
        setBannerTextColor("#ffffff");
        setBannerUsePromotion(false);
        setHeroTitle("");
        setHeroSubtitle("");
        setHeroImages("");
        setHeroCtaText("");
        setHeroCtaLink("");
        setHeroHeight("80vh");
        setHeroOverlayOpacity(30);
        setHeroTextColor("#ffffff");
        setHeroTransition("fade");
        setSectionOrder(0);
        setSectionActive(true);
        setNewSectionType("");
    };

    const handleEdit = (section: StorefrontSection) => {
        setEditingSection(section);
        setNewSectionType(section.type);
        setSectionOrder(section.order);
        setSectionActive(section.isActive ?? true);

        const content = typeof section.content === 'string'
            ? JSON.parse(section.content)
            : section.content;

        if (section.type === "marquee") {
            setMarqueeText(content.text || "");
            setMarqueeAnimation(content.animation || "scroll");
            setMarqueeSpeed(content.speed || "normal");
            setMarqueeBgColor(content.styles?.backgroundColor || "#1a1a1a");
            setMarqueeTextColor(content.styles?.textColor || "#ffffff");
        } else if (section.type === "shoppable_video") {
            setVideoTitle(content.title || "");
            setVideoSubtitle(content.subtitle || "");
            setVideoUrl(content.videoUrl || "");
        } else if (section.type === "banner") {
            setBannerText(content.text || "");
            setBannerLink(content.link || "");
            setBannerBgColor(content.backgroundColor || "#000000");
            setBannerTextColor(content.textColor || "#ffffff");
            setBannerUsePromotion(content.usePromotion || false);
        } else if (section.type === "hero") {
            setHeroTitle(content.title || "");
            setHeroSubtitle(content.subtitle || "");
            setHeroImages(content.images ? content.images.join("\n") : (content.image || ""));
            setHeroCtaText(content.ctaText || "");
            setHeroCtaLink(content.ctaLink || "");
            setHeroHeight(content.styles?.height || "80vh");
            setHeroOverlayOpacity(content.styles?.overlayOpacity || 30);
            setHeroTextColor(content.styles?.textColor || "#ffffff");
            setHeroTransition(content.styles?.transition || "fade");
        }

        setIsDialogOpen(true);
    };

    const handleSubmit = () => {
        let sectionData: any = {
            type: newSectionType,
            order: sectionOrder,
            isActive: sectionActive,
            content: {},
        };

        if (newSectionType === "marquee") {
            sectionData.content = {
                text: marqueeText,
                animation: marqueeAnimation,
                speed: marqueeSpeed,
                styles: {
                    backgroundColor: marqueeBgColor,
                    textColor: marqueeTextColor,
                },
            };
        } else if (newSectionType === "shoppable_video") {
            sectionData.content = {
                title: videoTitle,
                subtitle: videoSubtitle,
                videoUrl: videoUrl,
                // For now we don't have a UI to pick products, so we'll leave it empty or rely on the component to fetch all
                productIds: [],
            };
        } else if (newSectionType === "banner") {
            sectionData.content = {
                text: bannerText,
                link: bannerLink,
                backgroundColor: bannerBgColor,
                textColor: bannerTextColor,
                usePromotion: bannerUsePromotion,
            };
        } else if (newSectionType === "hero") {
            const imagesList = heroImages.split("\n").map(url => url.trim()).filter(url => url.length > 0);
            sectionData.content = {
                title: heroTitle,
                subtitle: heroSubtitle,
                images: imagesList,
                image: imagesList[0] || "", // Fallback for legacy
                ctaText: heroCtaText,
                ctaLink: heroCtaLink,
                styles: {
                    height: heroHeight,
                    overlayOpacity: heroOverlayOpacity,
                    textColor: heroTextColor,
                    textAlign: "center", // Default for now
                    transition: heroTransition,
                }
            };
        }

        if (editingSection) {
            updateMutation.mutate({ id: editingSection.id, data: sectionData });
        } else {
            createMutation.mutate(sectionData);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Page Builder</h1>
                    <p className="text-muted-foreground">Manage homepage sections and layouts</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingSection(null);
                        resetForm();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Section
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingSection ? "Edit Section" : "New Section"}</DialogTitle>
                            <DialogDescription>
                                {editingSection ? "Update the section settings" : "Choose a section type and configure it"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Section Type Selection */}
                            {!editingSection && (
                                <div className="space-y-2">
                                    <Label>Section Type</Label>
                                    <Select value={newSectionType} onValueChange={setNewSectionType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select section type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SECTION_TYPES.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    <div className="flex items-center gap-2">
                                                        <type.icon className="h-4 w-4" />
                                                        <span>{type.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Hero Configuration */}
                            {newSectionType === "hero" && (
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                                    <h4 className="font-medium">Hero Section Settings</h4>

                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={heroTitle}
                                            onChange={(e) => setHeroTitle(e.target.value)}
                                            placeholder="Welcome to LunaVeil"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Subtitle</Label>
                                        <Textarea
                                            value={heroSubtitle}
                                            onChange={(e) => setHeroSubtitle(e.target.value)}
                                            placeholder="Discover our premium collection"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Image URLs (One per line for slideshow)</Label>
                                        <Textarea
                                            value={heroImages}
                                            onChange={(e) => setHeroImages(e.target.value)}
                                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                                            rows={4}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Enter multiple URLs to create a slideshow. The first image will be the default.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>CTA Button Text</Label>
                                            <Input
                                                value={heroCtaText}
                                                onChange={(e) => setHeroCtaText(e.target.value)}
                                                placeholder="Shop Now"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CTA Link</Label>
                                            <Input
                                                value={heroCtaLink}
                                                onChange={(e) => setHeroCtaLink(e.target.value)}
                                                placeholder="/collections/all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Height</Label>
                                            <Select value={heroHeight} onValueChange={setHeroHeight}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="60vh">Small (60vh)</SelectItem>
                                                    <SelectItem value="80vh">Medium (80vh)</SelectItem>
                                                    <SelectItem value="100vh">Full Screen (100vh)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Transition Style</Label>
                                            <Select value={heroTransition} onValueChange={setHeroTransition}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fade">Fade</SelectItem>
                                                    <SelectItem value="slide">Slide Horizontal</SelectItem>
                                                    <SelectItem value="zoom">Zoom In</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Overlay Opacity (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={heroOverlayOpacity}
                                                onChange={(e) => setHeroOverlayOpacity(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Text Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={heroTextColor}
                                                    onChange={(e) => setHeroTextColor(e.target.value)}
                                                    className="w-12 h-10 p-1 cursor-pointer"
                                                />
                                                <Input
                                                    value={heroTextColor}
                                                    onChange={(e) => setHeroTextColor(e.target.value)}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Marquee Configuration */}
                            {newSectionType === "marquee" && (
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                                    <h4 className="font-medium">Announcement Bar Settings</h4>

                                    <div className="space-y-2">
                                        <Label>Banner Text</Label>
                                        <Textarea
                                            value={marqueeText}
                                            onChange={(e) => setMarqueeText(e.target.value)}
                                            placeholder="✨ FREE SHIPPING on orders over ৳2,000 ✨"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Animation Style</Label>
                                            <Select value={marqueeAnimation} onValueChange={setMarqueeAnimation}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MARQUEE_ANIMATIONS.map((anim) => (
                                                        <SelectItem key={anim.id} value={anim.id}>
                                                            {anim.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Speed</Label>
                                            <Select value={marqueeSpeed} onValueChange={setMarqueeSpeed}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="slow">Slow</SelectItem>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="fast">Fast</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Background Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={marqueeBgColor}
                                                    onChange={(e) => setMarqueeBgColor(e.target.value)}
                                                    className="w-12 h-10 p-1 cursor-pointer"
                                                />
                                                <Input
                                                    value={marqueeBgColor}
                                                    onChange={(e) => setMarqueeBgColor(e.target.value)}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Text Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={marqueeTextColor}
                                                    onChange={(e) => setMarqueeTextColor(e.target.value)}
                                                    className="w-12 h-10 p-1 cursor-pointer"
                                                />
                                                <Input
                                                    value={marqueeTextColor}
                                                    onChange={(e) => setMarqueeTextColor(e.target.value)}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="space-y-2">
                                        <Label>Preview</Label>
                                        <div
                                            className="py-2 px-4 rounded-md text-sm text-center overflow-hidden"
                                            style={{
                                                backgroundColor: marqueeBgColor,
                                                color: marqueeTextColor
                                            }}
                                        >
                                            {marqueeText || "Your announcement text here..."}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Shoppable Video Configuration */}
                            {newSectionType === "shoppable_video" && (
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                                    <h4 className="font-medium">Video Section Settings</h4>

                                    <div className="space-y-2">
                                        <Label>Section Title</Label>
                                        <Input
                                            value={videoTitle}
                                            onChange={(e) => setVideoTitle(e.target.value)}
                                            placeholder="Get the Look"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Subtitle</Label>
                                        <Input
                                            value={videoSubtitle}
                                            onChange={(e) => setVideoSubtitle(e.target.value)}
                                            placeholder="Featured products from this video"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Video URL (MP4)</Label>
                                        <Input
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            placeholder="https://example.com/video.mp4"
                                        />
                                        <p className="text-xs text-muted-foreground">Direct link to an MP4 file is recommended.</p>
                                    </div>
                                </div>
                            )}

                            {/* Banner Configuration */}
                            {newSectionType === "banner" && (
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                                    <h4 className="font-medium">Promo Banner Settings</h4>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="use-promotion"
                                            checked={bannerUsePromotion}
                                            onCheckedChange={setBannerUsePromotion}
                                        />
                                        <Label htmlFor="use-promotion">Sync with Active Promotion</Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        If enabled, the banner text will automatically display the latest active promotion description.
                                    </p>

                                    {!bannerUsePromotion && (
                                        <div className="space-y-2">
                                            <Label>Banner Text</Label>
                                            <Input
                                                value={bannerText}
                                                onChange={(e) => setBannerText(e.target.value)}
                                                placeholder="e.g. Summer Sale - Up to 50% Off"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Link URL (Optional)</Label>
                                        <Input
                                            value={bannerLink}
                                            onChange={(e) => setBannerLink(e.target.value)}
                                            placeholder="/collections/sale"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Background Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={bannerBgColor}
                                                    onChange={(e) => setBannerBgColor(e.target.value)}
                                                    className="w-12 h-10 p-1 cursor-pointer"
                                                />
                                                <Input
                                                    value={bannerBgColor}
                                                    onChange={(e) => setBannerBgColor(e.target.value)}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Text Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={bannerTextColor}
                                                    onChange={(e) => setBannerTextColor(e.target.value)}
                                                    className="w-12 h-10 p-1 cursor-pointer"
                                                />
                                                <Input
                                                    value={bannerTextColor}
                                                    onChange={(e) => setBannerTextColor(e.target.value)}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order & Active Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Display Order</Label>
                                    <Input
                                        type="number"
                                        value={sectionOrder}
                                        onChange={(e) => setSectionOrder(parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                    <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <div className="flex items-center gap-2 h-10">
                                        <Switch
                                            checked={sectionActive}
                                            onCheckedChange={setSectionActive}
                                        />
                                        <span className="text-sm">{sectionActive ? "Active" : "Hidden"}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                className="w-full"
                                disabled={!newSectionType || createMutation.isPending || updateMutation.isPending}
                            >
                                {editingSection ? "Update Section" : "Create Section"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Sections List */}
            <Card>
                <CardHeader>
                    <CardTitle>Homepage Sections</CardTitle>
                    <CardDescription>Drag to reorder, click to edit</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading sections...</div>
                    ) : localSections.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No sections yet. Click "Add Section" to create one.
                        </div>
                    ) : (
                        <Reorder.Group axis="y" values={localSections} onReorder={handleReorder} className="space-y-2">
                            {localSections.map((section) => (
                                <SortableSectionItem
                                    key={section.id}
                                    section={section}
                                    onEdit={handleEdit}
                                    onDelete={(id) => deleteMutation.mutate(id)}
                                    onToggleActive={(id, isActive) => toggleActiveMutation.mutate({ id, isActive })}
                                />
                            ))}
                        </Reorder.Group>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
