import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import { CartProvider } from "@/lib/cart-context";
import { FlyToCartProvider } from "@/lib/fly-to-cart-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductsPage from "@/pages/products";
import Checkout from "@/pages/checkout";
import Login from "@/pages/login";
import CollectionPage from "@/pages/collection";
import Dashboard from "@/pages/admin/dashboard";
import Products from "@/pages/admin/products";
import Orders from "@/pages/admin/orders";
import POS from "@/pages/admin/pos";
import Invoices from "@/pages/admin/invoices";
import InvoicePrint from "@/pages/admin/invoice-print";
import Settings from "@/pages/admin/settings";
import AdminUsers from "@/pages/admin/users";
import AdminCollections from "@/pages/admin/collections";
import AdminPromotions from "@/pages/admin/promotions";
import AdminStorefront from "@/pages/admin/storefront";
import AdminBuilder from "@/pages/admin/builder/index";
import PageBuilder from "@/pages/admin/page-builder";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: authData, isLoading } = useQuery<{ user: any }>({
    queryKey: ["/api/auth/me"],
    queryFn: () => apiRequest("GET", "/api/auth/me"),
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !authData?.user) {
      setLocation("/login");
    }
  }, [authData, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!authData?.user) {
    return null;
  }

  return <>{children}</>;
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();

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

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.removeQueries({
        predicate: ({ queryKey }) => {
          return queryKey.some((key) => {
            if (typeof key === "string") {
              return key.startsWith("/api/auth") || key.startsWith("/api/admin");
            }
            return false;
          });
        },
      });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setLanguage(language === "en" ? "bn" : "en")}
                className="font-medium"
              >
                {language === "en" ? "EN" : "BN"}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleTheme}
                data-testid="button-theme-toggle-admin"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-background">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={Login} />
      <Route path="/collections/:slug" component={CollectionPage} />

      <Route path="/admin">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/products">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Products />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/orders">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Orders />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/pos">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <POS />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/invoices">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Invoices />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/invoices/:id/print" component={InvoicePrint} />

      <Route path="/admin/users">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <div className="p-8">
                <AdminUsers />
              </div>
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/collections">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <div className="p-8">
                <AdminCollections />
              </div>
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/promotions">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <div className="p-8">
                <AdminPromotions />
              </div>
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/storefront">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <div className="p-8">
                <AdminStorefront />
              </div>
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/page-builder">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <div className="p-8">
                <PageBuilder />
              </div>
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/builder">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <AdminBuilder />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin/settings">
        {() => (
          <ProtectedRoute>
            <AdminLayout>
              <Settings />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <CartProvider>
            <FlyToCartProvider>
              <Toaster />
              <Router />
            </FlyToCartProvider>
          </CartProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
