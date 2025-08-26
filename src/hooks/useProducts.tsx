import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
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

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('woocommerce_products')
        .select('*')
        .eq('status', 'publish')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری محصولات');
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedProducts = (limit: number = 3) => {
    return products
      .filter(product => product.in_stock)
      .slice(0, limit);
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(product => 
      product.categories?.includes(category) && product.in_stock
    );
  };

  const getProductsByType = (productType: string) => {
    return products.filter(product => 
      product.product_type === productType && product.in_stock
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getFeaturedProducts,
    getProductsByCategory,
    getProductsByType,
  };
};