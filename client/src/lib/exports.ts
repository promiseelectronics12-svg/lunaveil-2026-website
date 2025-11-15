import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Invoice, InvoiceItem, CompanySettings, Product } from "@shared/schema";

interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

function formatCurrency(amount: number, language: "en" | "bn"): string {
  const formatted = new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(amount);
  
  // Preserve locale-formatted digits, just ensure consistent currency symbol
  if (language === "bn") {
    return formatted.replace("BDT", "৳");
  }
  return formatted.replace("BDT", "৳");
}

export function exportInvoiceToPDF(
  invoice: InvoiceWithItems,
  settings: CompanySettings,
  language: "en" | "bn"
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Company header with branding
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 50, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text(settings.companyName, pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(settings.companyAddress, pageWidth / 2, 28, { align: "center" });
  doc.text(`${language === "en" ? "Phone" : "ফোন"}: ${settings.companyPhone}`, pageWidth / 2, 34, { align: "center" });
  if (settings.companyEmail) {
    doc.text(`${language === "en" ? "Email" : "ইমেইল"}: ${settings.companyEmail}`, pageWidth / 2, 40, { align: "center" });
  }
  
  doc.setTextColor(0, 0, 0);

  // Invoice details
  doc.setFontSize(16);
  doc.text(language === "en" ? "INVOICE" : "চালান", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(10);
  const leftCol = 14;
  const rightCol = pageWidth - 14;
  
  doc.text(`${language === "en" ? "Invoice No" : "চালান নং"}: ${invoice.invoiceNumber}`, leftCol, 60);
  doc.text(`${language === "en" ? "Date" : "তারিখ"}: ${new Date(invoice.date).toLocaleDateString()}`, rightCol, 60, { align: "right" });
  
  if (invoice.customerName) {
    doc.text(`${language === "en" ? "Customer" : "ক্রেতা"}: ${invoice.customerName}`, leftCol, 66);
  }
  if (invoice.customerPhone) {
    doc.text(`${language === "en" ? "Phone" : "ফোন"}: ${invoice.customerPhone}`, leftCol, 72);
  }

  // Items table
  const tableData = invoice.items.map((item) => [
    language === "en" ? item.productNameEn : item.productNameBn,
    item.quantity.toString(),
    formatCurrency(Number(item.price), language),
    formatCurrency(Number(item.subtotal), language),
  ]);

  autoTable(doc, {
    startY: 80,
    head: [[
      language === "en" ? "Product" : "পণ্য",
      language === "en" ? "Qty" : "পরিমাণ",
      language === "en" ? "Price" : "মূল্য",
      language === "en" ? "Total" : "মোট"
    ]],
    body: tableData,
    foot: [[
      { content: language === "en" ? "Subtotal" : "সাবটোটাল", colSpan: 3, styles: { halign: "right", fontStyle: "bold" } },
      formatCurrency(Number(invoice.subtotal), language)
    ]],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold" },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 80;

  // Summary
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`${language === "en" ? "Delivery Charge" : "ডেলিভারি চার্জ"}: ${formatCurrency(Number(invoice.deliveryCharge), language)}`, rightCol, finalY + 10, { align: "right" });
  doc.text(`${language === "en" ? "Discount" : "ছাড়"}: ${formatCurrency(Number(invoice.discount), language)}`, rightCol, finalY + 16, { align: "right" });
  
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setFillColor(41, 128, 185);
  doc.setTextColor(255, 255, 255);
  doc.rect(rightCol - 60, finalY + 20, 60, 10, "F");
  doc.text(`${language === "en" ? "Grand Total" : "সর্বমোট"}: ${formatCurrency(Number(invoice.total), language)}`, rightCol - 2, finalY + 27, { align: "right" });
  doc.setTextColor(0, 0, 0);

  // Payment info
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`${language === "en" ? "Payment Method" : "পেমেন্ট পদ্ধতি"}: ${invoice.paymentMethod}`, leftCol, finalY + 24);
  doc.text(`${language === "en" ? "Status" : "অবস্থা"}: ${invoice.status}`, leftCol, finalY + 30);

  if (invoice.notes) {
    doc.text(`${language === "en" ? "Notes" : "নোট"}: ${invoice.notes}`, leftCol, finalY + 36);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.text(settings.invoiceFooterText || (language === "en" ? "Thank you for your business!" : "ধন্যবাদ!"), pageWidth / 2, footerY, { align: "center" });

  // Save the PDF
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}

export function exportInvoicesToExcel(
  invoices: Invoice[],
  language: "en" | "bn"
) {
  const headers = language === "en" 
    ? ["Invoice No", "Date", "Customer", "Phone", "Address", "Subtotal", "Delivery", "Discount", "Total", "Payment", "Status", "Type"]
    : ["চালান নং", "তারিখ", "ক্রেতা", "ফোন", "ঠিকানা", "সাবটোটাল", "ডেলিভারি", "ছাড়", "মোট", "পেমেন্ট", "অবস্থা", "টাইপ"];

  const translateStatus = (status: string) => {
    if (language === "bn") {
      const statusMap: Record<string, string> = {
        "paid": "পরিশোধিত",
        "pending": "অপেক্ষমাণ",
        "cancelled": "বাতিল",
      };
      return statusMap[status] || status;
    }
    return status;
  };

  const translatePayment = (method: string) => {
    if (language === "bn") {
      const methodMap: Record<string, string> = {
        "cash": "নগদ",
        "card": "কার্ড",
        "mobile": "মোবাইল",
      };
      return methodMap[method] || method;
    }
    return method;
  };

  const data = invoices.map((inv) => [
    inv.invoiceNumber,
    new Date(inv.date).toLocaleDateString(language === "bn" ? "bn-BD" : "en-BD"),
    inv.customerName || "",
    inv.customerPhone || "",
    inv.customerAddress || "",
    Number(inv.subtotal),
    Number(inv.deliveryCharge),
    Number(inv.discount),
    Number(inv.total),
    translatePayment(inv.paymentMethod),
    translateStatus(inv.status),
    inv.isPOS ? (language === "bn" ? "পিওএস" : "POS") : (language === "bn" ? "ওয়েবসাইট" : "Website"),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Set column widths
  ws["!cols"] = [
    { wch: 12 }, // Invoice No
    { wch: 12 }, // Date
    { wch: 20 }, // Customer
    { wch: 15 }, // Phone
    { wch: 30 }, // Address
    { wch: 10 }, // Subtotal
    { wch: 10 }, // Delivery
    { wch: 10 }, // Discount
    { wch: 10 }, // Total
    { wch: 12 }, // Payment
    { wch: 12 }, // Status
    { wch: 10 }, // Type
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, language === "en" ? "Invoices" : "চালান");
  
  XLSX.writeFile(wb, `invoices-${new Date().toISOString().split("T")[0]}.xlsx`);
}

export function exportProductsToExcel(
  products: Product[],
  language: "en" | "bn"
) {
  const headers = language === "en"
    ? ["Name (EN)", "Name (BN)", "Description (EN)", "Description (BN)", "Category", "Price", "Stock", "Barcode"]
    : ["নাম (ইংরেজি)", "নাম (বাংলা)", "বিবরণ (ইংরেজি)", "বিবরণ (বাংলা)", "বিভাগ", "মূল্য", "স্টক", "বারকোড"];

  const data = products.map((p) => [
    p.nameEn,
    p.nameBn,
    p.descriptionEn || "",
    p.descriptionBn || "",
    p.category,
    p.price,
    p.stock,
    p.barcode || "",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  ws["!cols"] = [
    { wch: 25 }, // Name EN
    { wch: 25 }, // Name BN
    { wch: 40 }, // Description EN
    { wch: 40 }, // Description BN
    { wch: 15 }, // Category
    { wch: 10 }, // Price
    { wch: 10 }, // Stock
    { wch: 15 }, // Barcode
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, language === "en" ? "Products" : "পণ্য");
  
  XLSX.writeFile(wb, `products-${new Date().toISOString().split("T")[0]}.xlsx`);
}
