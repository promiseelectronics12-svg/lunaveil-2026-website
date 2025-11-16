import { useLanguage } from "@/lib/language-context";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CompanySettings } from "@shared/schema";

export function CustomerFooter() {
  const { t } = useLanguage();
  
  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ["/api/settings"],
  });

  return (
    <footer className="bg-card border-t mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-serif font-semibold mb-4 text-foreground">
              LUNAVEIL
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.about")}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-muted-foreground hover-elevate inline-block px-1" data-testid="link-footer-home">
                  {t("nav.home")}
                </a>
              </li>
              <li>
                <a href="/#products" className="text-sm text-muted-foreground hover-elevate inline-block px-1" data-testid="link-footer-products">
                  {t("nav.products")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{settings?.companyPhone || "+880 1234-567890"}</span>
              </li>
              {settings?.companyEmail && (
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{settings.companyEmail}</span>
                </li>
              )}
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{settings?.companyAddress || "Dhaka, Bangladesh"}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              {t("footer.payment")}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {t("checkout.cod")}
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover-elevate p-2 rounded-md" data-testid="link-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover-elevate p-2 rounded-md" data-testid="link-instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8">
          <p className="text-center text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
