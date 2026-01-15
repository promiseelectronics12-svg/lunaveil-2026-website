import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Orders() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/orders/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: language === "bn" ? "অর্ডার আপডেট হয়েছে" : "Order updated",
      });
      setSelectedOrder(null);
    },
  });

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    const items = await apiRequest("GET", `/api/orders/${order.id}/items`) as OrderItem[];
    setSelectedOrderItems(items);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      rejected: "destructive",
      delivered: "default",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("admin.orders")}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm text-muted-foreground">
            {language === "bn" ? `মোট ${orders.length} অর্ডার` : `${orders.length} total orders`}
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
                  <TableHead>{language === "bn" ? "গ্রাহক" : "Customer"}</TableHead>
                  <TableHead>{language === "bn" ? "ফোন" : "Phone"}</TableHead>
                  <TableHead>{language === "bn" ? "ঠিকানা" : "Address"}</TableHead>
                  <TableHead>{language === "bn" ? "মোট" : "Total"}</TableHead>
                  <TableHead>{language === "bn" ? "স্ট্যাটাস" : "Status"}</TableHead>
                  <TableHead className="text-right">{language === "bn" ? "কাজ" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {language === "bn" ? "কোন অর্ডার নেই" : "No orders yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell>{order.customerPhone}</TableCell>
                      <TableCell className="max-w-xs truncate">{order.customerAddress}</TableCell>
                      <TableCell className="font-semibold">৳{order.total}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => viewOrderDetails(order)}
                            data-testid={`button-view-${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === "pending" && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: "confirmed",
                                  })
                                }
                                data-testid={`button-confirm-${order.id}`}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: "rejected",
                                  })
                                }
                                data-testid={`button-reject-${order.id}`}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
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

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{language === "bn" ? "অর্ডার বিবরণ" : "Order Details"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("checkout.name")}</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("checkout.phone")}</p>
                  <p className="font-medium">{selectedOrder.customerPhone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">{t("checkout.address")}</p>
                  <p className="font-medium">{selectedOrder.customerAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("checkout.deliveryLocation")}</p>
                  <p className="font-medium capitalize">{selectedOrder.deliveryLocation.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{language === "bn" ? "স্ট্যাটাস" : "Status"}</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">{language === "bn" ? "পণ্য" : "Products"}</h4>
                <div className="space-y-2">
                  {selectedOrderItems.map((item) => {
                    const name = language === "bn" ? item.productNameBn : item.productNameEn;
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 rounded-md border"
                        data-testid={`order-item-${item.id}`}
                      >
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("common.quantity")}: {item.quantity} × ৳{item.price}
                          </p>
                        </div>
                        <p className="font-semibold">৳{item.subtotal}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                  <span className="font-medium">৳{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.delivery")}</span>
                  <span className="font-medium">৳{selectedOrder.deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>{t("checkout.total")}</span>
                  <span className="text-primary">৳{selectedOrder.total}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
