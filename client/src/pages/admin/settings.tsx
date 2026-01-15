import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanySettingsSchema, type CompanySettings } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { z } from "zod";

const formSchema = insertCompanySettingsSchema.extend({
  deliveryChargeInsideDhaka: z.string().min(1),
  deliveryChargeOutsideDhaka: z.string().min(1),
});

type FormData = z.infer<typeof formSchema>;

export default function Settings() {
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<CompanySettings>({
    queryKey: ["/api/settings"],
    queryFn: () => apiRequest("GET", "/api/settings"),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "LUNAVEIL",
      companyPhone: "",
      companyAddress: "",
      logoUrl: "",
      invoiceFooterText: "Thank you for shopping with LUNAVEIL",
      deliveryChargeInsideDhaka: "60",
      deliveryChargeOutsideDhaka: "120",
    },
    values: settings
      ? {
        companyName: settings.companyName || "LUNAVEIL",
        companyPhone: settings.companyPhone || "",
        companyAddress: settings.companyAddress || "",
        logoUrl: settings.logoUrl || "",
        invoiceFooterText: settings.invoiceFooterText || "Thank you for shopping with LUNAVEIL",
        deliveryChargeInsideDhaka: settings.deliveryChargeInsideDhaka?.toString() || "60",
        deliveryChargeOutsideDhaka: settings.deliveryChargeOutsideDhaka?.toString() || "120",
      }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: language === "bn" ? "সেটিংস সংরক্ষিত" : "Settings saved",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">{t("admin.settings")}</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">{t("admin.settings")}</h1>

      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "bn" ? "কোম্পানি তথ্য" : "Company Information"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "bn" ? "কোম্পানির নাম" : "Company Name"}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "bn" ? "ফোন নম্বর" : "Phone Number"}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "bn" ? "ঠিকানা" : "Address"}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="input-company-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "bn" ? "লোগো URL" : "Logo URL"}</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input {...field} value={field.value || ""} placeholder="https://..." data-testid="input-logo-url" />
                          {field.value && (
                            <div className="border rounded-md p-4 flex items-center justify-center bg-muted">
                              <img
                                src={field.value}
                                alt="Company Logo"
                                className="max-h-20 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        {language === "bn"
                          ? "আপনার কোম্পানির লোগো URL প্রবেশ করান"
                          : "Enter your company logo URL"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceFooterText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === "bn" ? "চালান ফুটার টেক্সট" : "Invoice Footer Text"}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-invoice-footer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryChargeInsideDhaka"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === "bn" ? "ঢাকার ভিতরে ডেলিভারি চার্জ (৳)" : "Delivery Charge Inside Dhaka (৳)"}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} data-testid="input-delivery-inside" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryChargeOutsideDhaka"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === "bn" ? "ঢাকার বাইরে ডেলিভারি চার্জ (৳)" : "Delivery Charge Outside Dhaka (৳)"}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} data-testid="input-delivery-outside" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-settings"
                >
                  {updateMutation.isPending ? t("common.loading") : t("common.save")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
