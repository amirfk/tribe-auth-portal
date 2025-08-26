/**
 * Persian utility functions for formatting and localization
 */

/**
 * Format price in Persian format with comma separators and Persian currency
 */
export function formatPersianPrice(price: number): string {
  if (price === 0) {
    return 'رایگان';
  }
  
  // Convert to Persian numbers and add comma separators
  return price.toLocaleString('fa-IR') + ' تومان';
}

/**
 * Convert English numbers to Persian numbers
 */
export function toPersianNumbers(text: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = text.toString();
  
  for (let i = 0; i < englishDigits.length; i++) {
    result = result.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
  }
  
  return result;
}

/**
 * Format discount percentage in Persian
 */
export function formatPersianDiscount(percentage: number): string {
  return `${toPersianNumbers(percentage)}% تخفیف`;
}

/**
 * Get Persian product type name
 */
export function getPersianProductType(type: string): string {
  const types: Record<string, string> = {
    'course': 'دوره',
    'ebook': 'کتاب الکترونیکی',
    'workshop': 'کارگاه',
    'physical': 'محصول فیزیکی'
  };
  
  return types[type] || type;
}

/**
 * Get appropriate CTA text based on product type and price
 */
export function getProductCTA(productType: string, price: number): string {
  if (price === 0) {
    return 'دریافت رایگان';
  }
  
  const ctas: Record<string, string> = {
    'course': 'شرکت در دوره',
    'ebook': 'دانلود کتاب',
    'workshop': 'ثبت نام کارگاه',
    'physical': 'خرید محصول'
  };
  
  return ctas[productType] || 'مشاهده محصول';
}