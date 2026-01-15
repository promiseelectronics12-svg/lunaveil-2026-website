import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPromotionSchema, type Promotion } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function AdminPromotions() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

    const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
        queryKey: ["/api/promotions"],
    });

    const form = useForm({
        resolver: zodResolver(insertPromotionSchema),
        defaultValues: {
            name: "",
            description: "",
            type: "free_delivery",
            value: "0",
            minOrderValue: "0",
            maxDiscount: "0",
            isActive: true,
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/promotions", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
            setIsDialogOpen(false);
            form.reset();
            toast({ title: "Success", description: "Promotion created successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("PATCH", `/api/promotions/${editingPromotion?.id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
            setIsDialogOpen(false);
            setEditingPromotion(null);
            form.reset();
            toast({ title: "Success", description: "Promotion updated successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/promotions/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
            toast({ title: "Success", description: "Promotion deleted successfully" });
        },
    });

    const onSubmit = (data: any) => {
        // Ensure numeric strings are handled if needed, but schema expects strings for decimals usually or numbers depending on zod schema
        // The schema uses decimal in pg/sqlite which are strings in JS usually to preserve precision, 
        // but zod schema might expect strings.
        if (editingPromotion) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (promotion: Promotion) => {
        setEditingPromotion(promotion);
        form.reset({
            name: promotion.name,
            description: promotion.description || "",
            type: promotion.type,
            value: promotion.value?.toString() || "0",
            minOrderValue: promotion.minOrderValue?.toString() || "0",
            maxDiscount: promotion.maxDiscount?.toString() || "0",
            isActive: promotion.isActive || true,
        });
        setIsDialogOpen(true);
    };

    const filteredPromotions = promotions.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingPromotion(null);
                        form.reset();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Promotion
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingPromotion ? "Edit Promotion" : "New Promotion"}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. Free Delivery > 2000" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Displayed to customers" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="free_delivery">Free Delivery</SelectItem>
                                                        <SelectItem value="percentage_discount">Percentage Discount</SelectItem>
                                                        <SelectItem value="fixed_discount">Fixed Discount</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="minOrderValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Min Order Value</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" step="0.01" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Value (Amount or %)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" step="0.01" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="maxDiscount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Max Discount (Cap)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" step="0.01" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
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
                                    {editingPromotion ? "Update" : "Create"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center py-4">
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search promotions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Min Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                            </TableRow>
                        ) : filteredPromotions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">No promotions found</TableCell>
                            </TableRow>
                        ) : (
                            filteredPromotions.map((promotion) => (
                                <TableRow key={promotion.id}>
                                    <TableCell className="font-medium">
                                        {promotion.name}
                                        {promotion.description && (
                                            <div className="text-xs text-muted-foreground">{promotion.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="capitalize">{promotion.type.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        {promotion.type === 'percentage_discount' ? `${promotion.value}%` :
                                            promotion.type === 'fixed_discount' ? `৳${promotion.value}` : '-'}
                                    </TableCell>
                                    <TableCell>৳{promotion.minOrderValue}</TableCell>
                                    <TableCell>{promotion.isActive ? "Active" : "Inactive"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(promotion)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(promotion.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
