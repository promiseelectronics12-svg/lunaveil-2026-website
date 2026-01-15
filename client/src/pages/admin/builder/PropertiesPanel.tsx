
import { StorefrontSection } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, AlignLeft, AlignCenter, AlignRight, Plus } from "lucide-react";
// Re-importing Plus to fix ReferenceError
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PropertiesPanelProps {
    selectedSection: StorefrontSection | null;
    onUpdate: (id: string, updates: Partial<StorefrontSection>) => void;
    onDelete: (id: string) => void;
}

export function PropertiesPanel({ selectedSection, onUpdate, onDelete }: PropertiesPanelProps) {
    if (!selectedSection) {
        return (
            <div className="w-80 border-l bg-muted/10 p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="text-muted-foreground">
                    <p>Select a section on the canvas to edit its properties.</p>
                </div>
            </div>
        );
    }

    const content = typeof selectedSection.content === 'string'
        ? JSON.parse(selectedSection.content)
        : selectedSection.content || {};

    // Ensure styles object exists
    const styles = content.styles || {};

    const handleContentChange = (key: string, value: any) => {
        onUpdate(selectedSection.id, {
            content: { ...content, [key]: value }
        });
    };

    const handleStyleChange = (key: string, value: any) => {
        onUpdate(selectedSection.id, {
            content: {
                ...content,
                styles: { ...styles, [key]: value }
            }
        });
    };

    return (
        <div className="w-80 border-l bg-background flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between bg-muted/10">
                <h2 className="font-semibold text-sm">Properties</h2>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                    {selectedSection.type}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <Accordion type="multiple" defaultValue={["content", "layout", "style"]} className="w-full">

                    {/* Content Section */}
                    <AccordionItem value="content">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/5">Content</AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Active</Label>
                                <Switch
                                    checked={selectedSection.isActive || false}
                                    onCheckedChange={(checked) => onUpdate(selectedSection.id, { isActive: checked })}
                                />
                            </div>

                            {selectedSection.type === "hero" && (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={content.title || ""}
                                            onChange={(e) => handleContentChange("title", e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Subtitle</Label>
                                        <Input
                                            value={content.subtitle || ""}
                                            onChange={(e) => handleContentChange("subtitle", e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Images</Label>
                                        <div className="space-y-2">
                                            {(content.images || [content.image || ""]).map((img: string, index: number) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        value={img}
                                                        onChange={(e) => {
                                                            const newImages = [...(content.images || [content.image || ""])];
                                                            newImages[index] = e.target.value;
                                                            // Update both 'images' array and legacy 'image' field (first image)
                                                            handleContentChange("images", newImages);
                                                            if (index === 0) handleContentChange("image", e.target.value);
                                                        }}
                                                        placeholder={`Image URL ${index + 1}`}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            const newImages = (content.images || [content.image || ""]).filter((_: string, i: number) => i !== index);
                                                            handleContentChange("images", newImages);
                                                            // Update legacy 'image' field if first image removed
                                                            if (index === 0 && newImages.length > 0) {
                                                                handleContentChange("image", newImages[0]);
                                                            } else if (newImages.length === 0) {
                                                                handleContentChange("image", "");
                                                            }
                                                        }}
                                                        disabled={(content.images || [content.image]).length <= 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => {
                                                    const newImages = [...(content.images || [content.image || ""]), ""];
                                                    handleContentChange("images", newImages);
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Add Image
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>CTA Text</Label>
                                        <Input
                                            value={content.ctaText || ""}
                                            onChange={(e) => handleContentChange("ctaText", e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>CTA Link</Label>
                                        <Input
                                            value={content.ctaLink || ""}
                                            onChange={(e) => handleContentChange("ctaLink", e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {selectedSection.type === "banner" && (
                                <div className="grid gap-2">
                                    <Label>Banner Text</Label>
                                    <Input
                                        value={content.text || ""}
                                        onChange={(e) => handleContentChange("text", e.target.value)}
                                    />
                                </div>
                            )}

                            {selectedSection.type === "marquee" && (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Announcement Text</Label>
                                        <Input
                                            value={content.text || ""}
                                            onChange={(e) => handleContentChange("text", e.target.value)}
                                            placeholder="✨ FREE SHIPPING on orders over ৳2,000 ✨"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Animation Style</Label>
                                        <Select
                                            value={content.animation || "scroll"}
                                            onValueChange={(val) => handleContentChange("animation", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select animation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="scroll">Scroll Left</SelectItem>
                                                <SelectItem value="scroll-reverse">Scroll Right</SelectItem>
                                                <SelectItem value="bounce">Bounce</SelectItem>
                                                <SelectItem value="fade">Fade In/Out</SelectItem>
                                                <SelectItem value="typewriter">Typewriter</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Speed</Label>
                                        <Select
                                            value={content.speed || "normal"}
                                            onValueChange={(val) => handleContentChange("speed", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select speed" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="slow">Slow</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="fast">Fast</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Background Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={styles.backgroundColor || "#1a1a1a"}
                                                onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                                                className="w-12 h-8 p-1"
                                            />
                                            <Input
                                                value={styles.backgroundColor || "#1a1a1a"}
                                                onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Text Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={styles.textColor || "#ffffff"}
                                                onChange={(e) => handleStyleChange("textColor", e.target.value)}
                                                className="w-12 h-8 p-1"
                                            />
                                            <Input
                                                value={styles.textColor || "#ffffff"}
                                                onChange={(e) => handleStyleChange("textColor", e.target.value)}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedSection.type === "product_grid" && (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Source</Label>
                                        <Select
                                            value={content.filterType || "all"}
                                            onValueChange={(val) => handleContentChange("filterType", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Products</SelectItem>
                                                <SelectItem value="collection">Collection</SelectItem>
                                                <SelectItem value="hot">Hot Products</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {content.filterType === "collection" && (
                                        <div className="grid gap-2">
                                            <Label>Collection ID</Label>
                                            <Input
                                                value={content.collectionId || ""}
                                                onChange={(e) => handleContentChange("collectionId", e.target.value)}
                                                placeholder="Enter collection ID"
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label>Section Title</Label>
                                        <Input
                                            value={content.title || ""}
                                            onChange={(e) => handleContentChange("title", e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Background Image URL</Label>
                                        <Input
                                            value={styles.backgroundImage || ""}
                                            onChange={(e) => handleStyleChange("backgroundImage", e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    {/* Layout Section */}
                    <AccordionItem value="layout">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/5">Layout</AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 space-y-4">
                            {selectedSection.type === "hero" && (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Layout Variant</Label>
                                        <ToggleGroup
                                            type="single"
                                            value={styles.variant || "overlay"}
                                            onValueChange={(val) => val && handleStyleChange("variant", val)}
                                            className="justify-start"
                                        >
                                            <ToggleGroupItem value="overlay" aria-label="Overlay" className="flex gap-2 px-3">
                                                <div className="w-4 h-4 border border-current bg-current opacity-20" />
                                                Overlay
                                            </ToggleGroupItem>
                                            <ToggleGroupItem value="split" aria-label="Split" className="flex gap-2 px-3">
                                                <div className="flex w-4 h-4 border border-current">
                                                    <div className="w-1/2 bg-current opacity-20" />
                                                </div>
                                                Split
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>

                                    {styles.variant === "split" && (
                                        <div className="grid gap-2">
                                            <Label>Image Position</Label>
                                            <ToggleGroup
                                                type="single"
                                                value={styles.imagePosition || "left"}
                                                onValueChange={(val) => val && handleStyleChange("imagePosition", val)}
                                                className="justify-start"
                                            >
                                                <ToggleGroupItem value="left">Left</ToggleGroupItem>
                                                <ToggleGroupItem value="right">Right</ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>
                                    )}

                                    <div className="grid gap-3">
                                        <div className="flex justify-between">
                                            <Label>Height</Label>
                                            <span className="text-xs text-muted-foreground">{styles.height || "80vh"}</span>
                                        </div>
                                        <Slider
                                            defaultValue={[parseInt(styles.height) || 80]}
                                            max={100}
                                            step={5}
                                            onValueChange={(vals) => handleStyleChange("height", `${vals[0]}vh`)}
                                        />
                                    </div>

                                    {styles.variant === "split" && (
                                        <div className="grid gap-2">
                                            <Label>Image Fit</Label>
                                            <ToggleGroup
                                                type="single"
                                                value={styles.imageFit || "cover"}
                                                onValueChange={(val) => val && handleStyleChange("imageFit", val)}
                                                className="justify-start"
                                            >
                                                <ToggleGroupItem value="cover">Cover</ToggleGroupItem>
                                                <ToggleGroupItem value="contain">Contain</ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="grid gap-2">
                                <Label>Text Alignment</Label>
                                <ToggleGroup
                                    type="single"
                                    value={styles.textAlign || "center"}
                                    onValueChange={(val) => val && handleStyleChange("textAlign", val)}
                                    className="justify-start"
                                >
                                    <ToggleGroupItem value="left" aria-label="Left">
                                        <AlignLeft className="h-4 w-4" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="center" aria-label="Center">
                                        <AlignCenter className="h-4 w-4" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="right" aria-label="Right">
                                        <AlignRight className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            {selectedSection.type === "hero" && (
                                <div className="grid gap-2">
                                    <Label>Button Alignment</Label>
                                    <ToggleGroup
                                        type="single"
                                        value={styles.buttonAlignment || styles.textAlign || "center"}
                                        onValueChange={(val) => val && handleStyleChange("buttonAlignment", val)}
                                        className="justify-start"
                                    >
                                        <ToggleGroupItem value="left" aria-label="Left">
                                            <AlignLeft className="h-4 w-4" />
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="center" aria-label="Center">
                                            <AlignCenter className="h-4 w-4" />
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="right" aria-label="Right">
                                            <AlignRight className="h-4 w-4" />
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label>Padding</Label>
                                <Select
                                    value={styles.padding || "medium"}
                                    onValueChange={(val) => handleStyleChange("padding", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select padding" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="small">Small</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="large">Large</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Style Section */}
                    <AccordionItem value="style">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/5">Style</AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 space-y-4">
                            <div className="grid gap-2">
                                <Label>Text Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={styles.textColor || "#ffffff"}
                                        onChange={(e) => handleStyleChange("textColor", e.target.value)}
                                        className="w-12 h-8 p-1"
                                    />
                                    <Input
                                        value={styles.textColor || "#ffffff"}
                                        onChange={(e) => handleStyleChange("textColor", e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            {selectedSection.type === "banner" && (
                                <div className="grid gap-2">
                                    <Label>Background Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={styles.backgroundColor || "#000000"}
                                            onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                                            className="w-12 h-8 p-1"
                                        />
                                        <Input
                                            value={styles.backgroundColor || "#000000"}
                                            onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedSection.type === "hero" && (
                                <>
                                    <div className="grid gap-3">
                                        <div className="flex justify-between">
                                            <Label>Overlay Opacity</Label>
                                            <span className="text-xs text-muted-foreground">{styles.overlayOpacity || 30}%</span>
                                        </div>
                                        <Slider
                                            defaultValue={[styles.overlayOpacity ?? 30]}
                                            max={100}
                                            step={5}
                                            onValueChange={(vals) => handleStyleChange("overlayOpacity", vals[0])}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Button Size</Label>
                                        <Select
                                            value={styles.buttonSize || "medium"}
                                            onValueChange={(val) => handleStyleChange("buttonSize", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="small">Small</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="large">Large</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {styles.variant === "split" && (
                                        <div className="grid gap-2">
                                            <Label>Image Corner Radius</Label>
                                            <Select
                                                value={styles.imageRadius || "none"}
                                                onValueChange={(val) => handleStyleChange("imageRadius", val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select radius" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="small">Small</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="large">Large</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label>Transition Style</Label>
                                        <Select
                                            value={styles.transition || "fade"}
                                            onValueChange={(val) => handleStyleChange("transition", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select transition" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fade">Fade</SelectItem>
                                                <SelectItem value="slide">Slide Horizontal</SelectItem>
                                                <SelectItem value="zoom">Zoom In</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {selectedSection.type === "product_grid" && (
                                <div className="grid gap-3">
                                    <div className="flex justify-between">
                                        <Label>Overlay Opacity</Label>
                                        <span className="text-xs text-muted-foreground">{styles.overlayOpacity || 0}%</span>
                                    </div>
                                    <Slider
                                        defaultValue={[styles.overlayOpacity ?? 0]}
                                        max={100}
                                        step={5}
                                        onValueChange={(vals) => handleStyleChange("overlayOpacity", vals[0])}
                                    />


                                    <div className="flex items-center justify-between">
                                        <Label>Fade Edges</Label>
                                        <Switch
                                            checked={styles.fadeEdges || false}
                                            onCheckedChange={(checked) => handleStyleChange("fadeEdges", checked)}
                                        />
                                    </div>

                                    {styles.fadeEdges && (
                                        <div className="grid gap-3">
                                            <div className="flex justify-between">
                                                <Label>Fade Percentage</Label>
                                                <span className="text-xs text-muted-foreground">{styles.fadePercentage || 10}%</span>
                                            </div>
                                            <Slider
                                                defaultValue={[styles.fadePercentage ?? 10]}
                                                max={50}
                                                step={1}
                                                onValueChange={(vals) => handleStyleChange("fadePercentage", vals[0])}
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label>Image Aspect Ratio</Label>
                                        <Select
                                            value={styles.imageAspectRatio || "portrait"}
                                            onValueChange={(val) => handleStyleChange("imageAspectRatio", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select aspect ratio" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="square">Square (1:1)</SelectItem>
                                                <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                                                <SelectItem value="auto">Auto (Original)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Image Fit</Label>
                                        <Select
                                            value={styles.imageFit || "cover"}
                                            onValueChange={(val) => handleStyleChange("imageFit", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select fit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cover">Cover (Fill)</SelectItem>
                                                <SelectItem value="contain">Contain (Full Image)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <div className="p-4 border-t bg-muted/10">
                <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => onDelete(selectedSection.id)}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Section
                </Button>
            </div>
        </div >
    );
}
