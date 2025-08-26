import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ui/product-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductRecommendationsProps {
  resultType?: 'کوچینگ' | 'تراپی' | 'منتورینگ';
  productType?: 'course' | 'ebook' | 'workshop' | 'physical';
  limit?: number;
  showHeader?: boolean;
  title?: string;
  compact?: boolean;
}

export function ProductRecommendations({ 
  resultType,
  productType,
  limit = 3, 
  showHeader = true, 
  title,
  compact = false 
}: ProductRecommendationsProps) {
  const { products, loading } = useProducts();

  // Filter products based on result type and product type
  const getRelevantProducts = () => {
    let filtered = products.filter(product => product.in_stock);
    
    // Filter by product type if specified
    if (productType) {
      filtered = filtered.filter(product => product.product_type === productType);
    }
    
    if (resultType === 'کوچینگ') {
      // Prioritize coaching related products
      filtered = filtered.filter(product => 
        product.name.includes('کوچینگ') || 
        product.categories?.some(cat => cat.includes('کوچینگ'))
      );
    } else if (resultType === 'تراپی') {
      // Prioritize therapy related products
      filtered = filtered.filter(product => 
        product.name.includes('درمان') || 
        product.name.includes('تراپی') ||
        product.categories?.some(cat => cat.includes('درمان') || cat.includes('تراپی'))
      );
    } else if (resultType === 'منتورینگ') {
      // Prioritize mentoring related products
      filtered = filtered.filter(product => 
        product.name.includes('منتور') || 
        product.categories?.some(cat => cat.includes('منتور'))
      );
    }
    
    // If no specific products found, return general development products
    if (filtered.length === 0) {
      filtered = products.filter(product => 
        product.in_stock && 
        (product.categories?.includes('توسعه فردی') || product.categories?.includes('آموزش'))
      );
    }
    
    // If still no products, return first available products
    if (filtered.length === 0) {
      filtered = products.filter(product => product.in_stock);
    }
    
    return filtered.slice(0, limit);
  };

  const relevantProducts = getRelevantProducts();

  if (loading || relevantProducts.length === 0) {
    return null;
  }

  const getDefaultTitle = () => {
    if (title) return title;
    if (productType) {
      const typeNames = {
        course: 'دوره‌ها',
        ebook: 'کتاب‌های الکترونیکی', 
        workshop: 'کارگاه‌ها',
        physical: 'محصولات فیزیکی'
      };
      return `${typeNames[productType]} پیشنهادی`;
    }
    return resultType ? `محصولات پیشنهادی برای ${resultType}` : 'محصولات پیشنهادی';
  };

  return (
    <Card className="w-full bg-card/95 backdrop-blur-sm border-primary/10" dir="rtl">
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-row-reverse">
            <div className="flex items-center gap-2 flex-row-reverse">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg text-right">
                {getDefaultTitle()}
              </CardTitle>
            </div>
            <Link to="/store">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
                مشاهده همه
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-4" : "pt-0"}>
        <div className={`grid gap-4 ${
          compact 
            ? 'grid-cols-1' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {relevantProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              compact={compact}
            />
          ))}
        </div>
        
        {relevantProducts.length > 0 && (
          <div className="mt-4 text-center">
            <Link to="/store">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                مشاهده تمام محصولات
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}