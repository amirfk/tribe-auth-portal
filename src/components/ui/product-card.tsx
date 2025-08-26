import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatPersianPrice, formatPersianDiscount, getProductCTA } from "@/lib/persian-utils";

interface Product {
  id: string;
  woocommerce_id: number;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  regular_price: number;
  image_url?: string;
  product_url?: string;
  categories?: string[];
  status: string;
  in_stock: boolean;
  product_type?: string;
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const hasDiscount = product.sale_price && product.sale_price < product.regular_price;
  const displayPrice = product.sale_price || product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.regular_price - product.sale_price!) / product.regular_price) * 100)
    : 0;

  if (compact) {
    return (
      <Card className="w-full max-w-sm" dir="rtl">
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-3">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 text-right">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                <span className="font-bold text-primary">
                  {formatPersianPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPersianPrice(product.regular_price)}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {formatPersianDiscount(discountPercentage)}
                    </Badge>
                  </>
                )}
              </div>
              {product.product_url && (
                <Button variant="outline" size="sm" className="h-8 text-xs w-full" asChild>
                  <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 ml-1" />
                    مشاهده
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md overflow-hidden group hover:shadow-lg transition-shadow duration-300" dir="rtl">
      {product.image_url && (
        <div className="relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 right-2 text-xs"
            >
              {formatPersianDiscount(discountPercentage)}
            </Badge>
          )}
        </div>
      )}
      <CardContent className="p-4 text-right">
        <div className="space-y-3">
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2 leading-relaxed">
            {product.name}
          </h3>
          
          {product.short_description && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {product.short_description}
            </p>
          )}

          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end">
              {product.categories.slice(0, 3).map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between flex-row-reverse">
            <div className="flex items-center gap-2 flex-row-reverse">
              <span className="text-lg sm:text-xl font-bold text-primary">
                {formatPersianPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPersianPrice(product.regular_price)}
                </span>
              )}
            </div>
            
            {!product.in_stock && (
              <Badge variant="outline" className="text-destructive text-xs">
                ناموجود
              </Badge>
            )}
          </div>

          {product.product_url && (
            <Button className="w-full h-10 sm:h-12 text-sm" asChild>
              <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 ml-2" />
                {getProductCTA(product.product_type || 'course', displayPrice)}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}