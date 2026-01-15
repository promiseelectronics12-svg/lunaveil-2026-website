import { useState, useEffect } from "react";
import { CustomerHeader } from "@/components/customer-header";
import { CustomerFooter } from "@/components/customer-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/lib/language-context";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Product, CompanySettings } from "@shared/schema";
import { ShoppingBag, Tag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface CartItem extends Product {
  quantity: number;
}

export default function Checkout() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { cart, cartTotal, discountAmount, appliedPromotion } = useCart();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    deliveryLocation: "inside_dhaka" as "inside_dhaka" | "outside_dhaka",
  });

  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ["/api/settings"],
    queryFn: () => apiRequest("GET", "/api/settings"),
  });

  // Cart is now managed by context
  // useEffect(() => { ... }, []);

  const deliveryCharge =
    appliedPromotion?.type === "free_delivery" && cartTotal >= parseFloat(appliedPromotion.minOrderValue?.toString() || "0")
      ? 0
      : formData.deliveryLocation === "inside_dhaka"
        ? parseFloat(settings?.deliveryChargeInsideDhaka || "60")
        : parseFloat(settings?.deliveryChargeOutsideDhaka || "120");

  const subtotal = cartTotal;
  const total = subtotal + deliveryCharge - discountAmount;

  const orderMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/orders", data);
    },
    onSuccess: () => {
      toast({
        title: language === "bn" ? "অর্ডার সফল!" : "Order Successful!",
        description: language === "bn"
          ? "আপনার অর্ডার গ্রহণ করা হয়েছে।"
          : "Your order has been received.",
      });
      localStorage.removeItem("cart");
      setTimeout(() => setLocation("/"), 2000);
    },
    onError: () => {
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn"
          ? "অর্ডার প্রক্রিয়া করতে ব্যর্থ।"
          : "Failed to process order.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn"
          ? "সমস্ত ক্ষেত্র পূরণ করুন।"
          : "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn"
          ? "আপনার কার্ট খালি।"
          : "Your cart is empty.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      ...formData,
      deliveryCharge: deliveryCharge.toString(),
      subtotal: subtotal.toString(),
      total: total.toString(),
      status: "pending",
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

    orderMutation.mutate(orderData);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <CustomerHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {language === "bn" ? "আপনার কার্ট খালি" : "Your cart is empty"}
            </h2>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              {language === "bn" ? "শপিং চালিয়ে যান" : "Continue Shopping"}
            </Button>
          </div>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CustomerHeader />

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8 text-center text-foreground">
          {t("checkout.title")}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("checkout.customerInfo")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("checkout.name")}</Label>
                    <Input
                      id="name"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                      required
                      data-testid="input-customer-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("checkout.phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, customerPhone: e.target.value })
                      }
                      required
                      data-testid="input-customer-phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t("checkout.address")}</Label>
                    <Textarea
                      id="address"
                      value={formData.customerAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, customerAddress: e.target.value })
                      }
                      required
                      rows={3}
                      data-testid="input-customer-address"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>{t("checkout.deliveryLocation")}</Label>
                    <RadioGroup
                      value={formData.deliveryLocation}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          deliveryLocation: value as "inside_dhaka" | "outside_dhaka",
                        })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inside_dhaka" id="inside" data-testid="radio-inside-dhaka" />
                        <Label htmlFor="inside" className="font-normal cursor-pointer">
                          {t("checkout.insideDhaka")} (৳{settings?.deliveryChargeInsideDhaka || "60"})
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="outside_dhaka" id="outside" data-testid="radio-outside-dhaka" />
                        <Label htmlFor="outside" className="font-normal cursor-pointer">
                          {t("checkout.outsideDhaka")} (৳{settings?.deliveryChargeOutsideDhaka || "120"})
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={orderMutation.isPending}
                    data-testid="button-submit-order"
                  >
                    {orderMutation.isPending
                      ? t("common.loading")
                      : t("checkout.placeOrder")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t("checkout.orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => {
                  const name = language === "bn" ? item.nameBn : item.nameEn;
                  const price = item.discountedPrice
                    ? parseFloat(item.discountedPrice.toString())
                    : parseFloat(item.price.toString());
                  return (
                    <div key={item.id} className="flex justify-between text-sm" data-testid={`summary-item-${item.id}`}>
                      <span className="text-muted-foreground">
                        {name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        ৳{(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                    <span className="font-medium" data-testid="text-checkout-subtotal">৳{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {language === "bn" ? "ছাড়" : "Discount"}
                        {appliedPromotion && <span className="text-xs ml-1">({appliedPromotion.name})</span>}
                      </span>
                      <span className="font-medium">-৳{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.delivery")}</span>
                    <span className="font-medium" data-testid="text-checkout-delivery">
                      {deliveryCharge === 0 ? (
                        <span className="text-green-600">{language === "bn" ? "ফ্রি" : "Free"}</span>
                      ) : (
                        `৳${deliveryCharge.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>{t("checkout.total")}</span>
                    <span className="text-primary" data-testid="text-checkout-total">৳{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md text-sm text-center">
                  {t("checkout.cod")}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
