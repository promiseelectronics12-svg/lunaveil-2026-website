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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Search, Printer, FileDown, FileSpreadsheet, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import type { Invoice, InvoiceItem, CompanySettings } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { exportInvoiceToPDF, exportInvoicesToExcel } from "@/lib/exports";
import { useToast } from "@/hooks/use-toast";

export default function Invoices() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ["/api/settings"],
  });

  const filteredInvoices = invoices.filter((invoice) => {
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      (invoice.customerName && invoice.customerName.toLowerCase().includes(query))
    );
  });

  const handlePrint = (invoiceId: string) => {
    window.open(`/admin/invoices/${invoiceId}/print`, "_blank");
  };

  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExportPDF = async (invoiceId: string) => {
    if (!settings) {
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "কোম্পানি সেটিংস লোড হচ্ছে না" : "Company settings not loaded",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(invoiceId);
    try {
      const invoiceResponse = await fetch(`/api/invoices/${invoiceId}`);
      if (!invoiceResponse.ok) {
        throw new Error("Failed to fetch invoice");
      }
      const invoice = await invoiceResponse.json();

      const itemsResponse = await fetch(`/api/invoices/${invoiceId}/items`);
      if (!itemsResponse.ok) {
        throw new Error("Failed to fetch invoice items");
      }
      const items: InvoiceItem[] = await itemsResponse.json();

      exportInvoiceToPDF({ ...invoice, items }, settings, language);

      toast({
        title: language === "bn" ? "সফল" : "Success",
        description: language === "bn" ? "পিডিএফ ডাউনলোড হয়েছে" : "PDF downloaded successfully",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "পিডিএফ তৈরি করতে ব্যর্থ" : "Failed to create PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = () => {
    exportInvoicesToExcel(filteredInvoices, language);
    toast({
      title: language === "bn" ? "সফল" : "Success",
      description: language === "bn" ? "এক্সেল ডাউনলোড হয়েছে" : "Excel downloaded successfully",
    });
  };

  const returnInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      return await apiRequest("POST", `/api/invoices/${invoiceId}/return`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: language === "bn" ? "ফেরত সফল" : "Return successful",
        description: language === "bn" ? "চালান ফেরত হয়েছে এবং পণ্য স্টক পুনঃস্থাপিত হয়েছে" : "Invoice returned and products restocked",
      });
    },
    onError: () => {
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "চালান ফেরত করতে ব্যর্থ" : "Failed to return invoice",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("admin.invoices")}</h1>
        <Button
          onClick={handleExportExcel}
          disabled={filteredInvoices.length === 0}
          data-testid="button-export-excel"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {language === "bn" ? "এক্সেল রপ্তানি" : "Export Excel"}
        </Button>
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
                        <div className="flex items-center gap-2">
                          <Badge variant={invoice.isPOS ? "secondary" : "default"}>
                            {invoice.isPOS ? "POS" : "Website"}
                          </Badge>
                          {invoice.isReturned && (
                            <Badge variant="destructive">
                              {language === "bn" ? "ফেরত" : "Returned"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={`font-semibold ${invoice.isReturned ? 'line-through text-muted-foreground' : ''}`}>
                        ৳{invoice.total}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleExportPDF(invoice.id)}
                            disabled={isExporting === invoice.id}
                            data-testid={`button-pdf-${invoice.id}`}
                          >
                            {isExporting === invoice.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <FileDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handlePrint(invoice.id)}
                            data-testid={`button-print-${invoice.id}`}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          {!invoice.isReturned && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-orange-600 hover:text-orange-700"
                                  data-testid={`button-return-${invoice.id}`}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {language === "bn" ? "চালান ফেরত করুন" : "Return Invoice"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === "bn"
                                      ? `আপনি কি নিশ্চিত #${invoice.invoiceNumber} চালান ফেরত করতে চান? এটি পণ্যগুলি পুনরায় স্টকে যোগ করবে।`
                                      : `Are you sure you want to return invoice #${invoice.invoiceNumber}? This will restock the products.`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "bn" ? "বাতিল" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => returnInvoiceMutation.mutate(invoice.id)}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    {language === "bn" ? "ফেরত করুন" : "Return"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
    </div>
  );
}
