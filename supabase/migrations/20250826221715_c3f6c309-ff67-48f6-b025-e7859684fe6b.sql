-- Add product_type column to woocommerce_products table
ALTER TABLE public.woocommerce_products 
ADD COLUMN product_type TEXT DEFAULT 'course';

-- Add index for better performance on product_type filtering
CREATE INDEX idx_woocommerce_products_product_type ON public.woocommerce_products(product_type);

-- Update existing records to have 'course' as default product_type
UPDATE public.woocommerce_products 
SET product_type = 'course' 
WHERE product_type IS NULL;