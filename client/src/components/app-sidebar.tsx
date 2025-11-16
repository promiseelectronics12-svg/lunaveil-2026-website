import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/lib/language-context";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import logoImage from "@assets/generated_images/LUNAVEIL_brand_logo_design_9b211d42.png";

const menuItems = [
  {
    titleKey: "admin.dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    titleKey: "admin.products",
    url: "/admin/products",
    icon: Package,
  },
  {
    titleKey: "admin.orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    titleKey: "admin.pos",
    url: "/admin/pos",
    icon: Receipt,
  },
  {
    titleKey: "admin.invoices",
    url: "/admin/invoices",
    icon: FileText,
  },
  {
    titleKey: "admin.settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { t } = useLanguage();
  const [location] = useLocation();

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const currentLogo = settings?.logoUrl || logoImage;

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={currentLogo} alt="LUNAVEIL" className="h-10 w-10 object-contain" />
            <div>
              <h2 className="font-serif font-semibold text-lg text-sidebar-foreground">
                LUNAVEIL
              </h2>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`sidebar-link-${item.url.split('/').pop() || 'dashboard'}`}
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{t(item.titleKey)}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
