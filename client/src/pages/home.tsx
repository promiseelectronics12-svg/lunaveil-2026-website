import { useState } from "react";
import { CustomerHeader } from "@/components/customer-header";
import { CustomerFooter } from "@/components/customer-footer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { ShoppingBag, Minus, Plus, X } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { MobileNav } from "@/components/mobile-nav";
import { MobileMenu } from "@/components/mobile-menu";
import { useCart } from "@/lib/cart-context";
import { StorefrontRenderer } from "@/components/storefront/renderer";

export default function Home() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartOpen,
    setCartOpen,
    cartCount
  } = useCart();

  const proceedToCheckout = () => {
    setLocation("/checkout");
  };



  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
      <CustomerHeader cartItemCount={cartCount} onCartClick={() => setCartOpen(true)} />

      <main className="flex-1">
        <StorefrontRenderer />
      </main>

      <CustomerFooter />

      <MobileNav
        cartItemCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      <MobileMenu
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("checkout.orderSummary")}</SheetTitle>
          </SheetHeader>

          <div className="mt-8 flex flex-col h-[calc(100vh-8rem)]">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("product.addToCart")}</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-4">
                  {cart.map((item) => {
                    const name = language === "bn" ? item.nameBn : item.nameEn;
                    return (
                      <Card key={item.id} className="p-4" data-testid={`cart-item-${item.id}`}>
                        <div className="flex gap-4">
                          {item.images && item.images[0] && (
                            <img
                              src={item.images[0]}
                              alt={name}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1" data-testid={`text-cart-item-name-${item.id}`}>{name}</h4>
                            <div className="flex items-baseline gap-2">
                              {item.discountedPrice ? (
                                <>
                                  <span className="text-sm text-muted-foreground line-through">৳{item.price}</span>
                                  <span className="text-primary font-semibold">৳{item.discountedPrice}</span>
                                </>
                              ) : (
                                <span className="text-primary font-semibold">৳{item.price}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
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
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.id, 1)}
                                data-testid={`button-increase-${item.id}`}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => removeFromCart(item.id)}
                            data-testid={`button-remove-${item.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t("checkout.subtotal")}</span>
                    <span data-testid="text-cart-total">৳{cartTotal.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={proceedToCheckout}
                    data-testid="button-proceed-checkout"
                  >
                    {t("checkout.placeOrder")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
