import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Invoice, InvoiceItem, CompanySettings } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

export default function InvoicePrint() {
  const [, params] = useRoute("/admin/invoices/:id/print");
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: invoice, isLoading: invoiceLoading } = useQuery<Invoice>({
    queryKey: [`/api/invoices/${params?.id}`],
    enabled: !!params?.id,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<InvoiceItem[]>({
    queryKey: [`/api/invoices/${params?.id}/items`],
    enabled: !!params?.id,
  });

  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (invoice && items.length > 0 && !isPrinting) {
      setIsPrinting(true);
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [invoice, items, isPrinting]);

  if (invoiceLoading || itemsLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return <div className="p-8 text-center">Invoice not found</div>;
  }

  const companyName = settings?.companyName || "LUNAVEIL";
  const companyPhone = settings?.companyPhone || "+880 1XXX-XXXXXX";
  const companyAddress = settings?.companyAddress || "Dhaka, Bangladesh";
  const logoUrl = settings?.logoUrl;
  const footerText = settings?.invoiceFooterText || "Thank you for shopping with LUNAVEIL";

  return (
    <div className="print:p-0 p-8">
      <div className="max-w-4xl mx-auto bg-white text-black p-12 print:p-8 relative">
        {/* RETURNED Watermark */}
        {invoice.isReturned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="text-red-500/20 text-8xl font-bold transform -rotate-45 select-none whitespace-nowrap">
              RETURNED ORDER
            </div>
          </div>
        )}

        {/* Diagonal strikethrough line for returned invoices */}
        {invoice.isReturned && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100%" y2="100%" stroke="red" strokeWidth="2" strokeOpacity="0.3" />
            </svg>
          </div>
        )}
        <div className="text-center mb-8 border-b pb-6">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={companyName}
              className="h-20 mx-auto mb-3 object-contain"
            />
          )}
          <h1 className="text-3xl font-serif font-bold mb-2">{companyName}</h1>
          <p className="text-sm text-gray-600">{companyAddress}</p>
          <p className="text-sm text-gray-600">{companyPhone}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-sm mb-2">Customer Details:</h3>
            <p className="text-sm"><strong>Name:</strong> {invoice.customerName}</p>
            {invoice.customerPhone && (
              <p className="text-sm"><strong>Phone:</strong> {invoice.customerPhone}</p>
            )}
            {invoice.customerAddress && (
              <p className="text-sm"><strong>Address:</strong> {invoice.customerAddress}</p>
            )}
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-sm mb-2">Invoice Details:</h3>
            <p className="text-sm"><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
            <p className="text-sm">
              <strong>Date:</strong> {new Date(invoice.createdAt!).toLocaleDateString()}
            </p>
            {invoice.isPOS && (
              <p className="text-sm"><strong>Type:</strong> POS</p>
            )}
            {invoice.isReturned && (
              <p className="text-sm text-red-600">
                <strong>Returned:</strong> {invoice.returnedAt ? new Date(invoice.returnedAt).toLocaleDateString() : 'Yes'}
              </p>
            )}
          </div>
        </div>

        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-3 px-2 text-sm font-semibold">Item</th>
              <th className="text-center py-3 px-2 text-sm font-semibold">Qty</th>
              <th className="text-right py-3 px-2 text-sm font-semibold">Price</th>
              <th className="text-right py-3 px-2 text-sm font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="py-2 px-2 text-sm">{item.productNameEn}</td>
                <td className="text-center py-2 px-2 text-sm">{item.quantity}</td>
                <td className="text-right py-2 px-2 text-sm">৳{item.price}</td>
                <td className="text-right py-2 px-2 text-sm">৳{item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t-2 border-gray-800 pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">৳{invoice.subtotal}</span>
              </div>
              {parseFloat(invoice.deliveryCharge.toString()) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charge:</span>
                  <span className="font-semibold">৳{invoice.deliveryCharge}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>৳{invoice.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 pt-6 border-t">
          <p className="text-sm italic text-gray-600">{footerText}</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-0, .print\\:p-0 * {
            visibility: visible;
          }
          .print\\:p-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
