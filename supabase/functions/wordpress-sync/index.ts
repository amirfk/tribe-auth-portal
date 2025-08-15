import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WordPressUser {
  id: number;
  username: string;
  email: string;
  display_name: string;
  user_registered: string;
  roles: string[];
}

interface SupabaseUser {
  id: string;
  email: string;
  full_name?: string;
  wordpress_user_id?: number;
  wordpress_username?: string;
}

interface WooCommerceProduct {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: string;
  sale_price: string;
  regular_price: string;
  images: Array<{ src: string }>;
  permalink: string;
  categories: Array<{ name: string }>;
  status: string;
  stock_status: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle different request types
    let action, data;
    const url = new URL(req.url);
    
    if (req.method === 'GET') {
      action = url.searchParams.get('action') || 'test_connection';
      data = Object.fromEntries(url.searchParams.entries());
    } else {
      const contentType = req.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const body = await req.json();
        action = body.action;
        data = body.data;
      } else {
        action = 'test_connection';
        data = {};
      }
    }
    
    console.log('WordPress sync request:', { method: req.method, action, data })

    switch (action) {
      case 'test_connection':
        return await testConnection(supabaseClient, data)
      
      case 'sync_wordpress_user_to_supabase':
        return await syncWordPressUserToSupabase(supabaseClient, data)
      
      case 'sync_supabase_user_to_wordpress':
        return await syncSupabaseUserToWordPress(supabaseClient, data)
      
      case 'get_sync_status':
        return await getSyncStatus(supabaseClient, data)
      
      case 'sync_woocommerce_products':
        return await syncWooCommerceProducts(supabaseClient)
      
      case 'test_products_connection':
        return await testProductsConnection(supabaseClient)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('WordPress sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function syncWordPressUserToSupabase(supabaseClient: any, wordpressUser: WordPressUser) {
  console.log('Syncing WordPress user to Supabase:', wordpressUser)

  // Check if user already exists by email
  const { data: existingUser } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('email', wordpressUser.email)
    .maybeSingle()

  if (existingUser) {
    // Update existing user with WordPress data
    const { error } = await supabaseClient
      .from('profiles')
      .update({
        wordpress_user_id: wordpressUser.id,
        wordpress_username: wordpressUser.username,
        full_name: wordpressUser.display_name || existingUser.full_name,
        sync_source: 'wordpress',
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', existingUser.id)

    if (error) {
      console.error('Error updating existing user:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update existing user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Updated existing user with WordPress data')
    return new Response(
      JSON.stringify({ success: true, action: 'updated', user_id: existingUser.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else {
    // Create new Supabase auth user and profile
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email: wordpressUser.email,
      password: crypto.randomUUID(), // Generate random password
      email_confirm: true,
      user_metadata: {
        full_name: wordpressUser.display_name,
        wordpress_user_id: wordpressUser.id,
        wordpress_username: wordpressUser.username,
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create auth user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // The trigger will automatically create the profile, but we need to update it with WordPress data
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for trigger to execute

    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        wordpress_user_id: wordpressUser.id,
        wordpress_username: wordpressUser.username,
        sync_source: 'wordpress',
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', authUser.user.id)

    if (profileError) {
      console.error('Error updating new user profile:', profileError)
    }

    console.log('Created new user from WordPress data')
    return new Response(
      JSON.stringify({ success: true, action: 'created', user_id: authUser.user.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function syncSupabaseUserToWordPress(supabaseClient: any, supabaseUser: SupabaseUser) {
  console.log('Syncing Supabase user to WordPress:', supabaseUser)

  // Get WordPress API settings
  const { data: settings } = await supabaseClient
    .from('integration_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['wordpress_url', 'wordpress_api_key', 'wordpress_api_secret'])

  const settingsMap = settings?.reduce((acc: any, setting: any) => {
    acc[setting.setting_key] = setting.setting_value
    return acc
  }, {}) || {}

  if (!settingsMap.wordpress_url || !settingsMap.wordpress_api_key) {
    return new Response(
      JSON.stringify({ error: 'WordPress API credentials not configured' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create WordPress user via REST API
  const wpResponse = await fetch(`${settingsMap.wordpress_url}/wp-json/wp/v2/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${settingsMap.wordpress_api_key}:${settingsMap.wordpress_api_secret}`)}`
    },
    body: JSON.stringify({
      username: supabaseUser.email.split('@')[0] + '_' + Date.now(),
      email: supabaseUser.email,
      name: supabaseUser.full_name || 'User',
      password: crypto.randomUUID(),
      roles: ['customer']
    })
  })

  if (!wpResponse.ok) {
    const error = await wpResponse.text()
    console.error('WordPress API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create WordPress user' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const wpUser = await wpResponse.json()

  // Update Supabase profile with WordPress data
  const { error } = await supabaseClient
    .from('profiles')
    .update({
      wordpress_user_id: wpUser.id,
      wordpress_username: wpUser.username,
      sync_source: 'supabase',
      last_synced_at: new Date().toISOString(),
    })
    .eq('id', supabaseUser.id)

  if (error) {
    console.error('Error updating profile with WordPress data:', error)
  }

  console.log('Created WordPress user and updated Supabase profile')
  return new Response(
    JSON.stringify({ success: true, wordpress_user_id: wpUser.id }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function testConnection(supabaseClient: any, data: any) {
  try {
    // Get WordPress API settings
    const { data: settings } = await supabaseClient
      .from('integration_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['wordpress_url', 'wordpress_api_key', 'wordpress_api_secret'])

    const settingsMap = settings?.reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {}) || {}

    // Use settings from URL params if available (for testing before saving)
    const wpUrl = data.wordpress_url || settingsMap.wordpress_url
    const wpApiKey = data.wordpress_api_key || settingsMap.wordpress_api_key
    const wpApiSecret = data.wordpress_api_secret || settingsMap.wordpress_api_secret

    if (!wpUrl || !wpApiKey || !wpApiSecret) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WordPress credentials not provided' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Test the WordPress REST API connection
    const response = await fetch(`${wpUrl}/wp-json/wp/v2/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${wpApiKey}:${wpApiSecret}`)}`
      }
    })

    if (response.ok) {
      const userInfo = await response.json()
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Connection successful',
          wordpress_user: {
            id: userInfo.id,
            username: userInfo.username,
            name: userInfo.name
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `WordPress API error: ${response.status} - ${errorText}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Test connection error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Connection failed: ${error.message}` 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function getSyncStatus(supabaseClient: any, data: { user_id: string }) {
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('wordpress_user_id, wordpress_username, sync_source, last_synced_at')
    .eq('id', data.user_id)
    .maybeSingle()

  return new Response(
    JSON.stringify({ 
      success: true, 
      sync_status: profile ? {
        is_synced: !!profile.wordpress_user_id,
        wordpress_user_id: profile.wordpress_user_id,
        wordpress_username: profile.wordpress_username,
        sync_source: profile.sync_source,
        last_synced_at: profile.last_synced_at,
      } : null
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function syncWooCommerceProducts(supabaseClient: any) {
  try {
    console.log('Starting WooCommerce products sync...');

    // Get WordPress API credentials
    const { data: settings, error: settingsError } = await supabaseClient
      .from('integration_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['wordpress_url', 'wordpress_api_key', 'wordpress_api_secret']);

    if (settingsError) {
      throw new Error(`Failed to get settings: ${settingsError.message}`);
    }

    const settingsMap = settings?.reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {}) || {};

    const { wordpress_url, wordpress_api_key, wordpress_api_secret } = settingsMap;

    if (!wordpress_url || !wordpress_api_key || !wordpress_api_secret) {
      throw new Error('WordPress API credentials not configured');
    }

    // Fetch products from WooCommerce API
    const auth = btoa(`${wordpress_api_key}:${wordpress_api_secret}`);
    const apiUrl = `${wordpress_url}/wp-json/wc/v3/products?per_page=100&status=publish`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    const products: WooCommerceProduct[] = await response.json();
    console.log(`Fetched ${products.length} products from WooCommerce`);

    // Process and insert/update products
    const syncResults = [];
    for (const product of products) {
      try {
        const productData = {
          woocommerce_id: product.id,
          name: product.name,
          description: product.description?.replace(/<[^>]*>/g, '') || '', // Remove HTML tags
          short_description: product.short_description?.replace(/<[^>]*>/g, '') || '',
          price: parseFloat(product.price) || 0,
          sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
          regular_price: parseFloat(product.regular_price) || 0,
          image_url: product.images?.[0]?.src || null,
          product_url: product.permalink,
          categories: product.categories?.map(cat => cat.name) || [],
          status: product.status,
          in_stock: product.stock_status === 'instock',
          last_synced_at: new Date().toISOString()
        };

        // Upsert product (insert or update)
        const { error: upsertError } = await supabaseClient
          .from('woocommerce_products')
          .upsert(productData, { 
            onConflict: 'woocommerce_id',
            ignoreDuplicates: false 
          });

        if (upsertError) {
          console.error(`Error syncing product ${product.id}:`, upsertError);
          syncResults.push({ product_id: product.id, status: 'error', error: upsertError.message });
        } else {
          syncResults.push({ product_id: product.id, status: 'success' });
        }
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        syncResults.push({ product_id: product.id, status: 'error', error: error.message });
      }
    }

    const successCount = syncResults.filter(r => r.status === 'success').length;
    const errorCount = syncResults.filter(r => r.status === 'error').length;

    console.log(`Products sync completed: ${successCount} successful, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        message: 'Products sync completed',
        total_products: products.length,
        successful_syncs: successCount,
        failed_syncs: errorCount,
        sync_results: syncResults
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in syncWooCommerceProducts:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync WooCommerce products',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function testProductsConnection(supabaseClient: any) {
  try {
    console.log('Testing WooCommerce products API connection...');

    // Get WordPress API credentials
    const { data: settings, error: settingsError } = await supabaseClient
      .from('integration_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['wordpress_url', 'wordpress_api_key', 'wordpress_api_secret']);

    if (settingsError) {
      throw new Error(`Failed to get settings: ${settingsError.message}`);
    }

    const settingsMap = settings?.reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {}) || {};

    const { wordpress_url, wordpress_api_key, wordpress_api_secret } = settingsMap;

    if (!wordpress_url || !wordpress_api_key || !wordpress_api_secret) {
      throw new Error('WordPress API credentials not configured');
    }

    // Test WooCommerce API connection
    const auth = btoa(`${wordpress_api_key}:${wordpress_api_secret}`);
    const apiUrl = `${wordpress_url}/wp-json/wc/v3/products?per_page=1`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    const products = await response.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'WooCommerce products API connection successful',
        sample_products_count: Array.isArray(products) ? products.length : 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in testProductsConnection:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to test WooCommerce products connection',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}