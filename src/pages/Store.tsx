import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ui/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Store as StoreIcon, Filter, Sparkles, Package } from 'lucide-react';

const Store = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);

  // Get unique categories and product types
  const categories = useMemo(() => {
    const allCategories = products.flatMap(product => product.categories || []);
    return Array.from(new Set(allCategories));
  }, [products]);

  const productTypes = useMemo(() => {
    const allTypes = products.map(product => product.product_type || 'course');
    return Array.from(new Set(allTypes));
  }, [products]);

  // Filter products based on search, category, and product type
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || product.categories?.includes(selectedCategory);
      const matchesType = !selectedProductType || product.product_type === selectedProductType;
      
      return matchesSearch && matchesCategory && matchesType && product.in_stock;
    });
  }, [products, searchTerm, selectedCategory, selectedProductType]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-primary/5"></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-primary/5"></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">خطا در بارگذاری</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-primary/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/5),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.accent/10),transparent_60%)]"></div>
      
      <div className="relative z-10 min-h-screen px-4 py-8">
        {/* Header */}
        <header className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/lovable-uploads/636ebeb2-12fd-4466-b7ef-38352bd27b8a.png" 
                alt="Mina's Tribe Logo" 
                className="h-12 w-auto object-contain"
              />
              <StoreIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              فروشگاه مینا
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              مجموعه‌ای از دوره‌ها، کتاب‌ها، کارگاه‌ها و محصولات تخصصی برای رشد شما
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{products.length} محصول در دسترس</span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در محصولات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
                style={{ direction: 'rtl' }}
              />
            </div>
            
            {/* Product Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedProductType === null ? "default" : "outline"}
                onClick={() => setSelectedProductType(null)}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                همه محصولات
              </Button>
              {productTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedProductType === type ? "default" : "outline"}
                  onClick={() => setSelectedProductType(type)}
                >
                  {type === 'course' ? 'دوره‌ها' : 
                   type === 'ebook' ? 'کتاب‌های الکترونیکی' :
                   type === 'workshop' ? 'کارگاه‌ها' :
                   type === 'physical' ? 'محصولات فیزیکی' : type}
                </Button>
              ))}
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                همه دسته‌ها
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Results Info */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {filteredProducts.length} محصول یافت شد
              {selectedCategory && (
                <>
                  {' '}در دسته‌بندی{' '}
                  <Badge variant="secondary">{selectedCategory}</Badge>
                </>
              )}
              {selectedProductType && (
                <>
                  {' '}از نوع{' '}
                  <Badge variant="secondary">
                    {selectedProductType === 'course' ? 'دوره‌ها' : 
                     selectedProductType === 'ebook' ? 'کتاب‌های الکترونیکی' :
                     selectedProductType === 'workshop' ? 'کارگاه‌ها' :
                     selectedProductType === 'physical' ? 'محصولات فیزیکی' : selectedProductType}
                  </Badge>
                </>
              )}
            </p>
            {(selectedCategory || selectedProductType) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedProductType(null);
                }}
                className="text-sm"
              >
                حذف فیلترها
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <main className="max-w-7xl mx-auto">
          {filteredProducts.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">هیچ محصولی یافت نشد</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory || selectedProductType
                    ? 'لطفاً عبارت جستجو یا فیلترها را تغییر دهید'
                    : 'محصولی در حال حاضر موجود نیست'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Store;