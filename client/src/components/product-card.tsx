import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const { language, t } = useLanguage();
  const name = language === "bn" ? product.nameBn : product.nameEn;
  const description = language === "bn" ? product.descriptionBn : product.descriptionEn;
  const isOutOfStock = product.stock <= 0;

  return (
    <Card className="overflow-hidden hover-elevate transition-all cursor-pointer" onClick={() => onViewDetails?.(product)} data-testid={`card-product-${product.id}`}>
      <div className="aspect-square bg-muted relative overflow-hidden">
        {product.images && product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={name}
            className="w-full h-full object-cover"
            data-testid={`img-product-${product.id}`}
          />
        )}
        {isOutOfStock && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2"
            data-testid={`badge-out-of-stock-${product.id}`}
          >
            {t("product.outOfStock")}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-primary" data-testid={`text-product-price-${product.id}`}>
            ৳{product.price}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          className="flex-1"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          {t("product.addToCart")}
        </Button>
      </CardFooter>
    </Card>
  );
}
