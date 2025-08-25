import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
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

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('woocommerce_products')
        .select('*')
        .eq('status', 'publish')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری دوره‌ها');
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedCourses = (limit: number = 3) => {
    return courses
      .filter(course => course.in_stock)
      .slice(0, limit);
  };

  const getCoursesByCategory = (category: string) => {
    return courses.filter(course => 
      course.categories?.includes(category) && course.in_stock
    );
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    getFeaturedCourses,
    getCoursesByCategory,
  };
};