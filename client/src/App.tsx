import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/language-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/admin/dashboard";
import Products from "@/pages/admin/products";
import Orders from "@/pages/admin/orders";
import POS from "@/pages/admin/pos";
import Invoices from "@/pages/admin/invoices";
import InvoicePrint from "@/pages/admin/invoice-print";
import Settings from "@/pages/admin/settings";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle-admin"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
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
      <Route path="/checkout" component={Checkout} />
      
      <Route path="/admin">
        {() => (
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        )}
      </Route>
      
      <Route path="/admin/products">
        {() => (
          <AdminLayout>
            <Products />
          </AdminLayout>
        )}
      </Route>
      
      <Route path="/admin/orders">
        {() => (
          <AdminLayout>
            <Orders />
          </AdminLayout>
        )}
      </Route>
      
      <Route path="/admin/pos">
        {() => (
          <AdminLayout>
            <POS />
          </AdminLayout>
        )}
      </Route>
      
      <Route path="/admin/invoices">
        {() => (
          <AdminLayout>
            <Invoices />
          </AdminLayout>
        )}
      </Route>
      
      <Route path="/admin/invoices/:id/print" component={InvoicePrint} />
      
      <Route path="/admin/settings">
        {() => (
          <AdminLayout>
            <Settings />
          </AdminLayout>
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
          <Toaster />
          <Router />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
