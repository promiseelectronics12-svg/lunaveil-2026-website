import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, AlertTriangle, Clock } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order, Product } from "@shared/schema";

export default function Dashboard() {
  const { t, language } = useLanguage();

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const today = new Date().toDateString();
  const ordersToday = orders.filter(
    (order) => new Date(order.createdAt!).toDateString() === today
  );

  const totalSales = orders
    .filter((o) => o.status === "confirmed" || o.status === "delivered")
    .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

  const lowStockProducts = products.filter((p) => p.stock < 10);
  const pendingOrders = orders.filter((o) => o.status === "pending");

  const stats = [
    {
      title: language === "bn" ? "আজকের অর্ডার" : "Orders Today",
      value: ordersToday.length,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: language === "bn" ? "মোট বিক্রয়" : "Total Sales",
      value: `৳${totalSales.toFixed(0)}`,
      icon: Package,
      color: "text-green-600",
    },
    {
      title: language === "bn" ? "কম স্টক" : "Low Stock",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: language === "bn" ? "পেন্ডিং অর্ডার" : "Pending Orders",
      value: pendingOrders.length,
      icon: Clock,
      color: "text-purple-600",
    },
  ];

  const isLoading = ordersLoading || productsLoading;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">{t("admin.dashboard")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} data-testid={`card-stat-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold" data-testid={`text-stat-value-${index}`}>
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "bn" ? "সাম্প্রতিক অর্ডার" : "Recent Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {language === "bn" ? "কোন অর্ডার নেই" : "No orders yet"}
              </p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 rounded-md border hover-elevate"
                    data-testid={`order-item-${order.id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">৳{order.total}</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {language === "bn" ? "কম স্টক পণ্য" : "Low Stock Products"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {language === "bn" ? "সব পণ্য স্টকে আছে" : "All products in stock"}
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => {
                  const name = language === "bn" ? product.nameBn : product.nameEn;
                  return (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-3 rounded-md border hover-elevate"
                      data-testid={`low-stock-item-${product.id}`}
                    >
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">{product.stock} left</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
