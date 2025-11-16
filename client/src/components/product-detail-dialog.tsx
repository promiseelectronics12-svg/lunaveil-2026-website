import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import type { Product } from "@shared/schema";
import { X } from "lucide-react";
import { useState } from "react";

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (product: Product) => void;
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: ProductDetailDialogProps) {
  const { language, t } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  const name = language === "bn" ? product.nameBn : product.nameEn;
  const description = language === "bn" ? product.descriptionBn : product.descriptionEn;
  const isOutOfStock = product.stock <= 0;
  const images = product.images || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-product-detail">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" data-testid="text-product-detail-title">
            {name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {language === "bn" ? "পণ্যের বিস্তারিত তথ্য" : "Product details and information"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={name}
                  className="w-full h-full object-cover"
                  data-testid="img-product-detail-main"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  {language === "bn" ? "ছবি নেই" : "No image"}
                </div>
              )}
              {isOutOfStock && (
                <Badge
                  variant="secondary"
                  className="absolute top-4 right-4"
                  data-testid="badge-product-detail-out-of-stock"
                >
                  {t("product.outOfStock")}
                </Badge>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all hover-elevate ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                    data-testid={`button-thumbnail-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <Badge variant="outline" data-testid="badge-product-detail-category">
                {product.category}
              </Badge>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {product.discountedPrice ? (
                <>
                  <span className="text-2xl text-muted-foreground line-through" data-testid="text-product-detail-regular-price">
                    ৳{product.price}
                  </span>
                  <span className="text-4xl font-bold text-primary" data-testid="text-product-detail-discounted-price">
                    ৳{product.discountedPrice}
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-primary" data-testid="text-product-detail-price">
                  ৳{product.price}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div>
              <p className="text-sm text-muted-foreground">
                {language === "bn" ? "স্টক" : "Stock"}:
                <span
                  className={`ml-2 font-semibold ${
                    isOutOfStock
                      ? "text-destructive"
                      : product.stock < 10
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                  data-testid="text-product-detail-stock"
                >
                  {isOutOfStock
                    ? language === "bn"
                      ? "স্টক শেষ"
                      : "Out of Stock"
                    : `${product.stock} ${language === "bn" ? "টি" : "units"}`}
                </span>
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {language === "bn" ? "বিবরণ" : "Description"}
              </h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-product-detail-description">
                {description}
              </p>
            </div>

            {/* Add to Cart Button */}
            <Button
              className="w-full"
              size="lg"
              disabled={isOutOfStock}
              onClick={() => {
                if (onAddToCart) {
                  onAddToCart(product);
                  onOpenChange(false);
                }
              }}
              data-testid="button-product-detail-add-to-cart"
            >
              {t("product.addToCart")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
