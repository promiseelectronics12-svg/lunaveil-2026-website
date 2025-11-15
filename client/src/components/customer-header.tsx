import { ShoppingCart, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import logoImage from "@assets/generated_images/LUNAVEIL_brand_logo_design_9b211d42.png";

interface CustomerHeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
}

export function CustomerHeader({ cartItemCount = 0, onCartClick }: CustomerHeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 gap-4">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-3" data-testid="link-home">
              <img src={logoImage} alt="LUNAVEIL" className="h-10 w-10 object-contain" />
              <span className="text-2xl font-serif font-semibold text-foreground hidden sm:block">
                LUNAVEIL
              </span>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm font-medium" data-testid="link-nav-home">
              {t("nav.home")}
            </a>
            <a href="/#products" className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm font-medium" data-testid="link-nav-products">
              {t("nav.products")}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-md p-1">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  language === "en" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
                data-testid="button-language-en"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("bn")}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  language === "bn" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
                data-testid="button-language-bn"
              >
                BN
              </button>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="relative"
              onClick={onCartClick}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              <a
                href="/"
                className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-home"
              >
                {t("nav.home")}
              </a>
              <a
                href="/#products"
                className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mobile-products"
              >
                {t("nav.products")}
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
