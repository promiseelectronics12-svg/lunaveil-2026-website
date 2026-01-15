
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { StorefrontSection } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Toolbar } from "./Toolbar";
import { Sidebar } from "./Sidebar";
import { PropertiesPanel } from "./PropertiesPanel";
import { Canvas } from "./Canvas";

export default function VisualBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // State
    const [sections, setSections] = useState<StorefrontSection[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
    const [history, setHistory] = useState<StorefrontSection[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Fetch Data
    const { data: fetchedSections, isLoading } = useQuery<StorefrontSection[]>({
        queryKey: ["/api/storefront-sections"],
        queryFn: () => apiRequest("GET", "/api/storefront-sections"),
    });

    // Sync fetched data to local state
    useEffect(() => {
        if (fetchedSections) {
            setSections(fetchedSections);
            // Initialize history
            if (history.length === 0) {
                setHistory([fetchedSections]);
                setHistoryIndex(0);
            }
        }
    }, [fetchedSections]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (inputType: string) => {
            let type = inputType;
            let extraContent = {};

            if (inputType === "hot_deals") {
                type = "product_grid";
                extraContent = { title: "Hot Deals", filterType: "hot" };
            }

            const defaultContent = { ...getDefaultContent(type), ...extraContent };
            const newOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 0;
            return await apiRequest("POST", "/api/storefront-sections", {
                type,
                order: newOrder,
                content: defaultContent,
                isActive: true,
            }) as StorefrontSection;
        },
        onSuccess: (newSection: StorefrontSection) => {
            const newSections = [...sections, newSection];
            updateSections(newSections);
            setSelectedSectionId(newSection.id);
            toast({ title: "Section Added", description: `Added new ${newSection.type}` });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await apiRequest("PATCH", `/api/storefront-sections/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/storefront-sections"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/storefront-sections/${id}`);
        },
        onSuccess: (_, id) => {
            const newSections = sections.filter(s => s.id !== id);
            updateSections(newSections);
            setSelectedSectionId(null);
            toast({ title: "Deleted", description: "Section removed" });
        },
    });

    const saveOrderMutation = useMutation({
        mutationFn: async (orderedSections: StorefrontSection[]) => {
            await Promise.all(orderedSections.map((section, index) =>
                apiRequest("PATCH", `/api/storefront-sections/${section.id}`, { order: index })
            ));
        },
        onSuccess: () => {
            toast({ title: "Saved", description: "Layout saved successfully" });
        }
    });

    // Helper: Update sections with history tracking
    const updateSections = (newSections: StorefrontSection[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newSections);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setSections(newSections);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setSections(history[historyIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setSections(history[historyIndex + 1]);
        }
    };

    const handleLocalUpdate = (id: string, updates: Partial<StorefrontSection>) => {
        const newSections = sections.map(s => s.id === id ? { ...s, ...updates } : s);
        setSections(newSections);
        // Debounce actual API save could happen here, or explicit save button
    };

    const handleSave = async () => {
        // Save all changes
        try {
            await saveOrderMutation.mutateAsync(sections);

            // Also save individual section updates if any (simplified for now)
            // In a real app we'd track dirty states
            for (const section of sections) {
                await updateMutation.mutateAsync({
                    id: section.id, data: {
                        content: section.content,
                        isActive: section.isActive
                    }
                });
            }

            toast({ title: "Success", description: "All changes saved" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
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

    if (isLoading) return <div className="flex items-center justify-center h-screen">Loading Builder...</div>;

    const selectedSection = sections.find(s => s.id === selectedSectionId) || null;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <Toolbar
                deviceMode={deviceMode}
                setDeviceMode={setDeviceMode}
                onSave={handleSave}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
                isSaving={saveOrderMutation.isPending || updateMutation.isPending}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar onAddComponent={(type) => createMutation.mutate(type)} />

                <Canvas
                    sections={sections}
                    deviceMode={deviceMode}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={setSelectedSectionId}
                    onUpdate={handleLocalUpdate}
                    onReorder={(newOrder) => {
                        setSections(newOrder); // Update local state immediately for drag smoothness
                        // We don't push to history on every drag frame, maybe onDragEnd? 
                        // For now, let's just update state.
                    }}
                />

                <PropertiesPanel
                    selectedSection={selectedSection}
                    onUpdate={handleLocalUpdate}
                    onDelete={(id) => deleteMutation.mutate(id)}
                />
            </div>
        </div>
    );
}
