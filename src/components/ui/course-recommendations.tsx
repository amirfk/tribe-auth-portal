import { useCourses } from '@/hooks/useCourses';
import { ProductCard } from '@/components/ui/product-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseRecommendationsProps {
  resultType?: 'کوچینگ' | 'تراپی' | 'منتورینگ';
  limit?: number;
  showHeader?: boolean;
  title?: string;
  compact?: boolean;
}

export function CourseRecommendations({ 
  resultType, 
  limit = 3, 
  showHeader = true, 
  title,
  compact = false 
}: CourseRecommendationsProps) {
  const { courses, loading } = useCourses();

  // Filter courses based on result type
  const getRelevantCourses = () => {
    let filtered = courses.filter(course => course.in_stock);
    
    if (resultType === 'کوچینگ') {
      // Prioritize coaching related courses
      filtered = filtered.filter(course => 
        course.name.includes('کوچینگ') || 
        course.categories?.some(cat => cat.includes('کوچینگ'))
      );
    } else if (resultType === 'تراپی') {
      // Prioritize therapy related courses
      filtered = filtered.filter(course => 
        course.name.includes('درمان') || 
        course.name.includes('تراپی') ||
        course.categories?.some(cat => cat.includes('درمان') || cat.includes('تراپی'))
      );
    } else if (resultType === 'منتورینگ') {
      // Prioritize mentoring related courses
      filtered = filtered.filter(course => 
        course.name.includes('منتور') || 
        course.categories?.some(cat => cat.includes('منتور'))
      );
    }
    
    // If no specific courses found, return general development courses
    if (filtered.length === 0) {
      filtered = courses.filter(course => 
        course.in_stock && 
        (course.categories?.includes('توسعه فردی') || course.categories?.includes('آموزش'))
      );
    }
    
    // If still no courses, return first available courses
    if (filtered.length === 0) {
      filtered = courses.filter(course => course.in_stock);
    }
    
    return filtered.slice(0, limit);
  };

  const relevantCourses = getRelevantCourses();

  if (loading || relevantCourses.length === 0) {
    return null;
  }

  const defaultTitle = resultType 
    ? `دوره‌های پیشنهادی برای ${resultType}`
    : 'دوره‌های پیشنهادی';

  return (
    <Card className="w-full bg-card/95 backdrop-blur-sm border-primary/10">
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {title || defaultTitle}
              </CardTitle>
            </div>
            <Link to="/courses">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
                مشاهده همه
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-4" : "pt-0"}>
        <div className={`grid gap-4 ${
          compact 
            ? 'grid-cols-1' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {relevantCourses.map((course) => (
            <ProductCard 
              key={course.id} 
              product={course} 
              compact={compact}
            />
          ))}
        </div>
        
        {relevantCourses.length > 0 && (
          <div className="mt-4 text-center">
            <Link to="/courses">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                مشاهده تمام دوره‌ها
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}