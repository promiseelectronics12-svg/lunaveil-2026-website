import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Search, Plus, Minus, Trash2, Printer, Link as LinkIcon } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import type { Product, CompanySettings, Order, Promotion } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartItem extends Product {
  quantity: number;
}

export default function POS() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("inside_dhaka");
  const [deliveryCharge, setDeliveryCharge] = useState("60");
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [linkedOrderId, setLinkedOrderId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ["/api/settings"],
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: ordersDialogOpen,
  });

  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions/active"],
  });

  const subtotal = cart.reduce(
    (sum, item) => {
      const price = item.discountedPrice
        ? parseFloat(item.discountedPrice.toString())
        : parseFloat(item.price.toString());
      return sum + price * item.quantity;
    },
    0
  );

  // Recalculate delivery charge when dependencies change
  useEffect(() => {
    if (!settings) return;

    let charge = deliveryLocation === "inside_dhaka"
      ? parseFloat(settings.deliveryChargeInsideDhaka)
      : parseFloat(settings.deliveryChargeOutsideDhaka);

    // Apply free delivery promotion
    const freeDeliveryPromo = promotions.find(p => p.type === 'free_delivery' && p.isActive);
    if (freeDeliveryPromo) {
      const minOrderValue = parseFloat(freeDeliveryPromo.minOrderValue || "0");
      if (subtotal >= minOrderValue) {
        charge = 0;
      }
    }

    setDeliveryCharge(charge.toString());
  }, [subtotal, deliveryLocation, settings, promotions]);

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response;
    },
    onSuccess: async (invoice: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });

      // If this invoice was created from a linked order, mark it as delivered
      if (linkedOrderId) {
        try {
          await apiRequest("PATCH", `/api/orders/${linkedOrderId}`, { status: "delivered" });
          queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
          toast({
            title: language === "bn" ? "অর্ডার ডেলিভার হয়েছে" : "Order delivered",
            description: language === "bn"
              ? "অর্ডার স্ট্যাটাস ডেলিভার্ড এ আপডেট হয়েছে"
              : "Order status updated to delivered",
          });
        } catch (error) {
          console.error("Failed to update order status:", error);
        }
      }

      toast({
        title: language === "bn" ? "চালান তৈরি হয়েছে" : "Invoice created",
        description: `Invoice #${invoice.invoiceNumber}`,
      });
      resetForm();
      window.open(`/admin/invoices/${invoice.id}/print`, "_blank");
    },
    onError: (error: Error) => {
      console.error("Failed to create invoice:", error);
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: error.message || (language === "bn" ? "চালান তৈরি করতে ব্যর্থ" : "Failed to create invoice"),
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const name = language === "bn" ? product.nameBn : product.nameEn;
    return name.toLowerCase().includes(query) && product.stock > 0;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({
            title: language === "bn" ? "স্টক সীমা" : "Stock limit",
            variant: "destructive",
          });
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + change;
            if (newQuantity > item.stock) {
              toast({
                title: language === "bn" ? "স্টক সীমা" : "Stock limit",
                variant: "destructive",
              });
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const total = subtotal + parseFloat(deliveryCharge || "0");

  const resetForm = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setDeliveryLocation("inside_dhaka");
    // Delivery charge will be reset by useEffect
    setLinkedOrderId(null);
  };

  const handleDeliveryLocationChange = (value: string) => {
    setDeliveryLocation(value);
    // Delivery charge will be updated by useEffect
  };

  const validateCustomerDetails = () => {
    if (!customerName.trim()) {
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "গ্রাহকের নাম প্রয়োজন" : "Customer name is required",
        variant: "destructive",
      });
      return false;
    }
    if (!customerPhone.trim()) {
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "গ্রাহকের ফোন প্রয়োজন" : "Customer phone is required",
        variant: "destructive",
      });
      return false;
    }
    if (!customerAddress.trim()) {
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "গ্রাহকের ঠিকানা প্রয়োজন" : "Customer address is required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handlePrintInvoice = () => {
    if (cart.length === 0) {
      toast({
        title: language === "bn" ? "কার্ট খালি" : "Cart empty",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      customerName: customerName.trim() || "Walk-in Customer",
      customerPhone: customerPhone.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      deliveryCharge: deliveryCharge || "0",
      subtotal: subtotal.toString(),
      total: total.toString(),
      isPOS: true,
      items: cart.map((item) => {
        const regularPrice = parseFloat(item.price.toString());
        const effectivePrice = item.discountedPrice
          ? parseFloat(item.discountedPrice.toString())
          : regularPrice;
        return {
          productId: item.id,
          productNameEn: item.nameEn,
          productNameBn: item.nameBn,
          quantity: item.quantity,
          regularPrice: regularPrice.toString(),
          price: effectivePrice.toString(),
          subtotal: (effectivePrice * item.quantity).toString(),
        };
      }),
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  const loadCustomerFromOrder = async (order: Order) => {
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone);
    setCustomerAddress(order.customerAddress);
    setDeliveryLocation(order.deliveryLocation);
    setLinkedOrderId(order.id);

    // Delivery charge will be calculated by useEffect based on the loaded items (subtotal)

    try {
      const items = await apiRequest("GET", `/api/orders/${order.id}/items`) as any[];

      const newCartItems: CartItem[] = items.map((item) => {
        // Try to find the product in the products array
        const product = products.find(p => p.id === item.productId);

        if (product) {
          return {
            ...product,
            quantity: item.quantity
          };
        }

        // Fallback: Create cart item from order item data
        return {
          id: item.productId,
          nameEn: item.productNameEn,
          nameBn: item.productNameBn,
          descriptionEn: "",
          descriptionBn: "",
          price: item.regularPrice || item.price,
          discountedPrice: item.price !== item.regularPrice ? item.price : null,
          stock: 9999, // Allow adding since it was already ordered
          category: "",
          images: [],
          isHot: false,
          hotPrice: null,
          createdAt: null,
          updatedAt: null,
          quantity: item.quantity
        } as CartItem;
      });

      setCart(newCartItems);

      toast({
        title: language === "bn" ? "অর্ডার লোড হয়েছে" : "Order loaded",
        description: language === "bn"
          ? `${order.customerName} এর তথ্য এবং ${newCartItems.length}টি পণ্য`
          : `Loaded ${order.customerName}'s info and ${newCartItems.length} products`,
      });
    } catch (error) {
      console.error("Failed to load order items:", error);
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "পণ্য লোড করতে ব্যর্থ" : "Failed to load order items",
        variant: "destructive",
      });
    }

    setOrdersDialogOpen(false);
  };


  const filteredOrders = orders.filter((order) => {
    const query = orderSearchQuery.toLowerCase();
    return (
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.toLowerCase().includes(query) ||
      order.customerAddress.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">{t("admin.pos")}</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("common.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-pos-search"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                  {filteredProducts.map((product) => {
                    const name = language === "bn" ? product.nameBn : product.nameEn;
                    return (
                      <Card
                        key={product.id}
                        className="cursor-pointer hover-elevate transition-all"
                        onClick={() => addToCart(product)}
                        data-testid={`pos-product-${product.id}`}
                      >
                        <CardContent className="p-4">
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={name}
                              className="w-full h-24 object-cover rounded-md mb-2"
                            />
                          )}
                          <p className="font-medium text-sm line-clamp-2 mb-1">{name}</p>
                          <p className="text-primary font-semibold">৳{product.price}</p>
                          <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>{language === "bn" ? "বিল" : "Bill"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 pb-4 border-b">
                <div>
                  <Label htmlFor="customer-name">
                    {language === "bn" ? "গ্রাহকের নাম" : "Customer Name"}
                  </Label>
                  <Input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={language === "bn" ? "নাম লিখুন" : "Enter name"}
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone">
                    {language === "bn" ? "ফোন নম্বর" : "Phone Number"}
                  </Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={language === "bn" ? "ফোন নম্বর লিখুন" : "Enter phone number"}
                    data-testid="input-customer-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-address">
                    {language === "bn" ? "ঠিকানা" : "Address"}
                  </Label>
                  <Input
                    id="customer-address"
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder={language === "bn" ? "ঠিকানা লিখুন" : "Enter address"}
                    data-testid="input-customer-address"
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-location">
                    {language === "bn" ? "ডেলিভারি লোকেশন" : "Delivery Location"}
                  </Label>
                  <Select value={deliveryLocation} onValueChange={handleDeliveryLocationChange}>
                    <SelectTrigger id="delivery-location" data-testid="select-delivery-location">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inside_dhaka">
                        {language === "bn" ? "ঢাকার ভিতরে" : "Inside Dhaka"}
                      </SelectItem>
                      <SelectItem value="outside_dhaka">
                        {language === "bn" ? "ঢাকার বাইরে" : "Outside Dhaka"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {language === "bn" ? "কার্ট খালি" : "Cart is empty"}
                  </p>
                ) : (
                  cart.map((item) => {
                    const name = language === "bn" ? item.nameBn : item.nameEn;
                    return (
                      <Card key={item.id} className="p-3" data-testid={`cart-item-${item.id}`}>
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm flex-1">{name}</p>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => removeFromCart(item.id)}
                              data-testid={`button-remove-${item.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, -1)}
                                data-testid={`button-decrease-${item.id}`}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center" data-testid={`text-quantity-${item.id}`}>
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, 1)}
                                data-testid={`button-increase-${item.id}`}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-semibold">
                              ৳{(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div>
                  <Label htmlFor="delivery">{t("checkout.delivery")}</Label>
                  <Input
                    id="delivery"
                    type="number"
                    step="0.01"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    placeholder="0"
                    data-testid="input-delivery-charge"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                    <span className="font-medium" data-testid="text-pos-subtotal">৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.delivery")}</span>
                    <span className="font-medium">৳{parseFloat(deliveryCharge || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>{t("checkout.total")}</span>
                    <span className="text-primary" data-testid="text-pos-total">৳{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog open={ordersDialogOpen} onOpenChange={setOrdersDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="flex-1"
                        size="lg"
                        variant="outline"
                        data-testid="button-link-orders"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {language === "bn" ? "অর্ডার থেকে লোড" : "Link from Orders"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>
                          {language === "bn" ? "অর্ডার নির্বাচন করুন" : "Select Order"}
                        </DialogTitle>
                        <DialogDescription>
                          {language === "bn"
                            ? "গ্রাহকের তথ্য লোড করতে একটি অর্ডার নির্বাচন করুন"
                            : "Select an order to load customer information"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder={language === "bn" ? "নাম, ফোন বা ঠিকানা অনুসন্ধান করুন" : "Search by name, phone, or address"}
                            value={orderSearchQuery}
                            onChange={(e) => setOrderSearchQuery(e.target.value)}
                            className="pl-10"
                            data-testid="input-order-search"
                          />
                        </div>
                        <ScrollArea className="h-[400px] pr-4">
                          {isLoadingOrders ? (
                            <div className="space-y-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Card key={i}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-1/3" />
                                      </div>
                                      <div className="space-y-2">
                                        <Skeleton className="h-5 w-20" />
                                        <Skeleton className="h-4 w-16" />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : filteredOrders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              {language === "bn" ? "কোন অর্ডার পাওয়া যায়নি" : "No orders found"}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {filteredOrders.map((order) => (
                                <Card
                                  key={order.id}
                                  className="hover-elevate cursor-pointer"
                                  onClick={() => loadCustomerFromOrder(order)}
                                  data-testid={`order-card-${order.id}`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-1">
                                        <div className="font-semibold" data-testid={`order-name-${order.id}`}>
                                          {order.customerName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {order.customerPhone}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {order.customerAddress}
                                        </div>
                                        <div className="text-sm">
                                          <span className="text-muted-foreground">
                                            {language === "bn" ? "ডেলিভারি: " : "Delivery: "}
                                          </span>
                                          {order.deliveryLocation === "inside_dhaka"
                                            ? language === "bn"
                                              ? "ঢাকার ভিতরে"
                                              : "Inside Dhaka"
                                            : language === "bn"
                                              ? "ঢাকার বাইরে"
                                              : "Outside Dhaka"}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-semibold text-primary">
                                          ৳{parseFloat(order.total).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-muted-foreground capitalize">
                                          {order.status}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handlePrintInvoice}
                    disabled={createInvoiceMutation.isPending}
                    data-testid="button-print-invoice"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {createInvoiceMutation.isPending
                      ? t("common.loading")
                      : language === "bn"
                        ? "প্রিন্ট"
                        : "Print"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
