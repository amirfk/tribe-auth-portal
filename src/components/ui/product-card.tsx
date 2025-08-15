import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

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
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-primary">
                  ${displayPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.regular_price.toFixed(2)}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      -{discountPercentage}%
                    </Badge>
                  </>
                )}
              </div>
              {product.product_url && (
                <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                  <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
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
    <Card className="w-full max-w-md overflow-hidden">
      {product.image_url && (
        <div className="relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 right-2"
            >
              -{discountPercentage}% OFF
            </Badge>
          )}
        </div>
      )}
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2">
            {product.name}
          </h3>
          
          {product.short_description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {product.short_description}
            </p>
          )}

          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.categories.slice(0, 3).map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">
                ${displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.regular_price.toFixed(2)}
                </span>
              )}
            </div>
            
            {!product.in_stock && (
              <Badge variant="outline" className="text-destructive">
                Out of Stock
              </Badge>
            )}
          </div>

          {product.product_url && (
            <Button className="w-full" asChild>
              <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Course
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}