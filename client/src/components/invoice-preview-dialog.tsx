import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import type { Invoice, InvoiceItem, CompanySettings } from "@shared/schema";

interface InvoicePreviewDialogProps {
  invoice: Invoice | null;
  items: InvoiceItem[];
  settings: CompanySettings | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoicePreviewDialog({
  invoice,
  items,
  settings,
  open,
  onOpenChange,
}: InvoicePreviewDialogProps) {
  const { language } = useLanguage();

  if (!invoice || !settings) return null;

  const handlePrint = () => {
    window.print();
  };

  const companyName = settings.companyName;
  const companyAddress = settings.companyAddress;
  const companyPhone = settings.companyPhone;
  const logoUrl = settings.logoUrl;
  const footerText = settings.invoiceFooterText;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:shadow-none print:max-w-full" data-testid="dialog-invoice-preview">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-2xl font-bold">
              {language === "bn" ? "চালান প্রিভিউ" : "Invoice Preview"}
            </DialogTitle>
            <DialogDescription>
              {language === "bn"
                ? "চালান পর্যালোচনা করুন এবং প্রিন্ট করুন"
                : "Review and print the invoice"}
            </DialogDescription>
          </DialogHeader>

          <div className="print:hidden flex gap-2 justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-preview"
            >
              <X className="h-4 w-4 mr-2" />
              {language === "bn" ? "বন্ধ করুন" : "Close"}
            </Button>
            <Button onClick={handlePrint} data-testid="button-print-invoice-preview">
              <Printer className="h-4 w-4 mr-2" />
              {language === "bn" ? "প্রিন্ট করুন" : "Print"}
            </Button>
          </div>

          {/* Invoice Content - Printable */}
          <div className="bg-white text-black p-8 print:p-12" id="invoice-content">
            <div className="text-center mb-8 border-b pb-6">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="h-20 mx-auto mb-3 object-contain"
                  data-testid="img-invoice-logo"
                />
              )}
              <h1 className="text-3xl font-serif font-bold mb-2">{companyName}</h1>
              <p className="text-sm text-gray-600">{companyAddress}</p>
              <p className="text-sm text-gray-600">{companyPhone}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-sm mb-2">
                  {language === "bn" ? "গ্রাহকের বিবরণ:" : "Customer Details:"}
                </h3>
                <p className="text-sm">
                  <strong>{language === "bn" ? "নাম:" : "Name:"}</strong> {invoice.customerName}
                </p>
                {invoice.customerPhone && (
                  <p className="text-sm">
                    <strong>{language === "bn" ? "ফোন:" : "Phone:"}</strong> {invoice.customerPhone}
                  </p>
                )}
                {invoice.customerAddress && (
                  <p className="text-sm">
                    <strong>{language === "bn" ? "ঠিকানা:" : "Address:"}</strong>{" "}
                    {invoice.customerAddress}
                  </p>
                )}
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-sm mb-2">
                  {language === "bn" ? "চালানের বিবরণ:" : "Invoice Details:"}
                </h3>
                <p className="text-sm">
                  <strong>{language === "bn" ? "চালান নং:" : "Invoice No:"}</strong>{" "}
                  {invoice.invoiceNumber}
                </p>
                <p className="text-sm">
                  <strong>{language === "bn" ? "তারিখ:" : "Date:"}</strong>{" "}
                  {invoice.date
                    ? new Date(invoice.date).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")
                    : new Date().toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")}
                </p>
                {invoice.isPOS && (
                  <p className="text-sm">
                    <strong>{language === "bn" ? "ধরণ:" : "Type:"}</strong>{" "}
                    {language === "bn" ? "পিওএস" : "POS"}
                  </p>
                )}
              </div>
            </div>

            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-3 px-2 text-sm font-semibold">
                    {language === "bn" ? "পণ্য" : "Item"}
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold">
                    {language === "bn" ? "পরিমাণ" : "Qty"}
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold">
                    {language === "bn" ? "মূল্য" : "Price"}
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold">
                    {language === "bn" ? "মোট" : "Total"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const itemName = language === "bn" ? item.productNameBn : item.productNameEn;
                  return (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="py-2 px-2 text-sm">{itemName}</td>
                      <td className="text-center py-2 px-2 text-sm">{item.quantity}</td>
                      <td className="text-right py-2 px-2 text-sm">৳{item.price}</td>
                      <td className="text-right py-2 px-2 text-sm">৳{item.subtotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{language === "bn" ? "সাবটোটাল:" : "Subtotal:"}</span>
                  <span>
                    ৳
                    {(
                      parseFloat(invoice.total) -
                      (invoice.deliveryCharge ? parseFloat(invoice.deliveryCharge) : 0)
                    ).toFixed(2)}
                  </span>
                </div>
                {invoice.deliveryCharge && parseFloat(invoice.deliveryCharge) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{language === "bn" ? "ডেলিভারি চার্জ:" : "Delivery Charge:"}</span>
                    <span>৳{invoice.deliveryCharge}</span>
                  </div>
                )}
                {invoice.discount && parseFloat(invoice.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{language === "bn" ? "ছাড়:" : "Discount:"}</span>
                    <span>-৳{invoice.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>{language === "bn" ? "মোট:" : "Total:"}</span>
                  <span>৳{invoice.total}</span>
                </div>
              </div>
            </div>

            {footerText && (
              <div className="text-center text-sm text-gray-600 border-t pt-6">
                {footerText}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
