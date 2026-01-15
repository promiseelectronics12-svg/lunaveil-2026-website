import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Search, X, ImagePlus, FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { exportProductsToExcel } from "@/lib/exports";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { z } from "zod";

const formSchema = insertProductSchema.extend({
  price: z.string().min(1),
  discountedPrice: z.string().optional(),
  hotPrice: z.string().optional(),
  stock: z.string().min(1),
  isHot: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export default function Products() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameEn: "",
      nameBn: "",
      descriptionEn: "",
      descriptionBn: "",
      price: "",
      discountedPrice: "",
      hotPrice: "",
      stock: "",
      category: "",
      images: [],
      isHot: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: language === "bn" ? "পণ্য যোগ হয়েছে" : "Product added" });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Create product error:", error);
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "পণ্য যোগ করতে ব্যর্থ" : "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: language === "bn" ? "পণ্য আপডেট হয়েছে" : "Product updated" });
      setDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Update product error:", error);
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "পণ্য আপডেট করতে ব্যর্থ" : "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: language === "bn" ? "পণ্য মুছে ফেলা হয়েছে" : "Product deleted" });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      descriptionEn: product.descriptionEn,
      descriptionBn: product.descriptionBn,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || "",
      hotPrice: product.hotPrice?.toString() || "",
      stock: product.stock.toString(),
      category: product.category,
      images: product.images || [],
      isHot: product.isHot || false,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: FormData) => {
    // For Drizzle decimal fields, keep price as string
    // Only convert stock to number since it's an integer
    const productData = {
      ...data,
      stock: parseInt(data.stock, 10),
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.nameEn.toLowerCase().includes(query) ||
      product.nameBn.includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  });

  const handleExportExcel = () => {
    exportProductsToExcel(filteredProducts, language);
    toast({
      title: language === "bn" ? "সফল" : "Success",
      description: language === "bn" ? "এক্সেল ডাউনলোড হয়েছে" : "Excel downloaded successfully",
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("admin.products")}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={filteredProducts.length === 0}
            data-testid="button-export-products-excel"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {language === "bn" ? "এক্সেল রপ্তানি" : "Export Excel"}
          </Button>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingProduct(null);
                setNewImageUrl("");
                form.reset();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button data-testid="button-add-product">
                <Plus className="h-4 w-4 mr-2" />
                {language === "bn" ? "পণ্য যোগ করুন" : "Add Product"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct
                    ? language === "bn"
                      ? "পণ্য সম্পাদনা"
                      : "Edit Product"
                    : language === "bn"
                      ? "নতুন পণ্য"
                      : "New Product"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (English)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-name-en" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nameBn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (Bengali)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-name-bn" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="descriptionEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (English)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} data-testid="input-description-en" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="descriptionBn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Bengali)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} data-testid="input-description-bn" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regular Price (৳)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} data-testid="input-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discounted Price (৳) - Optional</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} data-testid="input-discounted-price" />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Leave empty if no discount
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-stock" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-category" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
                    <FormField
                      control={form.control}
                      name="isHot"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                          <div className="space-y-0.5">
                            <FormLabel>Mark as Hot Product</FormLabel>
                            <FormDescription>
                              Display this product in the "Hot Products" section
                            </FormDescription>
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

                    {form.watch("isHot") && (
                      <FormField
                        control={form.control}
                        name="hotPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hot Deal Price (৳)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                value={field.value || ""}
                                data-testid="input-hot-price"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Overrides regular price when Hot is enabled
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => {
                      const handleAddImage = () => {
                        const url = newImageUrl.trim();
                        const currentImages = field.value || [];
                        if (url && !currentImages.includes(url)) {
                          field.onChange([...currentImages, url]);
                          setNewImageUrl("");
                        }
                      };

                      const handleRemoveImage = (index: number) => {
                        const currentImages = field.value || [];
                        const newImages = currentImages.filter((_, i) => i !== index);
                        field.onChange(newImages);
                      };

                      return (
                        <FormItem>
                          <FormLabel>
                            {language === "bn" ? "পণ্য ছবি" : "Product Images"}
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Input
                                  placeholder={language === "bn" ? "ছবির URL প্রবেশ করান" : "Enter image URL"}
                                  value={newImageUrl}
                                  onChange={(e) => setNewImageUrl(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddImage();
                                    }
                                  }}
                                  data-testid="input-image-url"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleAddImage}
                                  data-testid="button-add-image"
                                >
                                  <ImagePlus className="h-4 w-4" />
                                </Button>
                              </div>

                              {field.value && field.value.length > 0 && (
                                <div className="grid grid-cols-3 gap-3" data-testid="image-preview-grid">
                                  {field.value.map((url, index) => (
                                    <div key={index} className="relative group" data-testid={`image-preview-${index}`}>
                                      <img
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-md border"
                                        onError={(e) => {
                                          e.currentTarget.src = "https://via.placeholder.com/150?text=Invalid+URL";
                                        }}
                                        data-testid={`img-product-preview-${index}`}
                                      />
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleRemoveImage(index)}
                                        data-testid={`button-remove-image-${index}`}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <FormDescription>
                                {language === "bn"
                                  ? "ছবির URL প্রবেশ করান এবং Enter চাপুন বা + বাটন ক্লিক করুন। আপনি একাধিক ছবি যোগ করতে পারেন।"
                                  : "Enter image URL and press Enter or click the + button. You can add multiple images."}
                              </FormDescription>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit-product"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? t("common.loading")
                      : t("common.save")}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-products"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "bn" ? "নাম" : "Name"}</TableHead>
                  <TableHead>{language === "bn" ? "বিভাগ" : "Category"}</TableHead>
                  <TableHead>{language === "bn" ? "মূল্য" : "Price"}</TableHead>
                  <TableHead>{language === "bn" ? "স্টক" : "Stock"}</TableHead>
                  <TableHead className="text-right">
                    {language === "bn" ? "কাজ" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {language === "bn" ? "কোন পণ্য নেই" : "No products found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-medium">
                        {language === "bn" ? product.nameBn : product.nameEn}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>৳{product.price}</TableCell>
                      <TableCell>
                        <span
                          className={
                            product.stock < 10 ? "text-orange-600 font-semibold" : ""
                          }
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(product.id)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
