import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBannerSchema, type Banner } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function AdminStorefront() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    const { data: banners = [], isLoading } = useQuery<Banner[]>({
        queryKey: ["/api/banners"],
    });

    const form = useForm({
        resolver: zodResolver(insertBannerSchema),
        defaultValues: {
            title: "",
            subtitle: "",
            image: "",
            link: "",
            position: "bento-1",
            isActive: true,
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/banners", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
            setIsDialogOpen(false);
            form.reset();
            toast({ title: "Success", description: "Banner created successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("PATCH", `/api/banners/${editingBanner?.id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
            setIsDialogOpen(false);
            setEditingBanner(null);
            form.reset();
            toast({ title: "Success", description: "Banner updated successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/banners/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
            toast({ title: "Success", description: "Banner deleted successfully" });
        },
    });

    const onSubmit = (data: any) => {
        if (editingBanner) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        form.reset({
            title: banner.title,
            subtitle: banner.subtitle || "",
            image: banner.image,
            link: banner.link || "",
            position: banner.position,
            isActive: banner.isActive || true,
        });
        setIsDialogOpen(true);
    };

    const positions = [
        { id: "bento-1", name: "Main Feature (Large)" },
        { id: "bento-2", name: "Side Top (Tall)" },
        { id: "bento-3", name: "Side Bottom (Standard)" },
        { id: "bento-4", name: "Wide Bottom" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Storefront Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingBanner(null);
                        form.reset();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Banner
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingBanner ? "Edit Banner" : "New Banner"}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subtitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subtitle</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image URL</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="link"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link (e.g., /collections/summer)</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select position" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {positions.map((pos) => (
                                                        <SelectItem key={pos.id} value={pos.id}>
                                                            {pos.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Active</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editingBanner ? "Update" : "Create"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {positions.map((pos) => {
                    const posBanners = banners.filter(b => b.position === pos.id);
                    return (
                        <Card key={pos.id} className="col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg">{pos.name}</CardTitle>
                                <CardDescription>Position: {pos.id}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {posBanners.length === 0 ? (
                                    <div className="text-sm text-muted-foreground italic">No active banners</div>
                                ) : (
                                    posBanners.map((banner) => (
                                        <div key={banner.id} className="relative group rounded-lg border p-3 space-y-2">
                                            <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                                                <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-medium truncate">{banner.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">{banner.subtitle}</p>
                                            </div>
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-background/80 p-1 rounded-md backdrop-blur-sm">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(banner)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteMutation.mutate(banner.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
