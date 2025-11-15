import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Search, Printer, Eye } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import type { Invoice } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Invoices() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const filteredInvoices = invoices.filter((invoice) => {
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.customerName.toLowerCase().includes(query)
    );
  });

  const handlePrint = (invoiceId: string) => {
    window.open(`/admin/invoices/${invoiceId}/print`, "_blank");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("admin.invoices")}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === "bn" ? "চালান বা গ্রাহক খুঁজুন" : "Search invoice or customer"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-invoices"
            />
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
                  <TableHead>{language === "bn" ? "চালান নং" : "Invoice No."}</TableHead>
                  <TableHead>{language === "bn" ? "গ্রাহক" : "Customer"}</TableHead>
                  <TableHead>{language === "bn" ? "তারিখ" : "Date"}</TableHead>
                  <TableHead>{language === "bn" ? "টাইপ" : "Type"}</TableHead>
                  <TableHead>{language === "bn" ? "মোট" : "Total"}</TableHead>
                  <TableHead className="text-right">{language === "bn" ? "কাজ" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {language === "bn" ? "কোন চালান নেই" : "No invoices found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>
                        {new Date(invoice.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.isPOS ? "secondary" : "default"}>
                          {invoice.isPOS ? "POS" : "Website"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">৳{invoice.total}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handlePrint(invoice.id)}
                            data-testid={`button-print-${invoice.id}`}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
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
    </div>
  );
}
