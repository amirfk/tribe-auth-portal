-- Create WooCommerce products table
CREATE TABLE public.woocommerce_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  woocommerce_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  regular_price DECIMAL(10,2),
  image_url TEXT,
  product_url TEXT,
  categories TEXT[],
  status TEXT DEFAULT 'publish',
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.woocommerce_products ENABLE ROW LEVEL SECURITY;

-- Create policies for product access
CREATE POLICY "Products are viewable by everyone" 
ON public.woocommerce_products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all products" 
ON public.woocommerce_products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better performance
CREATE INDEX idx_woocommerce_products_woocommerce_id ON public.woocommerce_products(woocommerce_id);
CREATE INDEX idx_woocommerce_products_status ON public.woocommerce_products(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_woocommerce_products_updated_at
BEFORE UPDATE ON public.woocommerce_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();