import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Forward request to n8n webhook
    const n8nWebhookUrl = 'https://farhadkouhi-qiu2gbbdf.liara.run/webhook/2f3b6a3a-f901-4695-b30a-e82f784f52d1';
    
    console.log('Forwarding request to n8n webhook:', requestBody);
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Increase to 60 seconds
    
    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw response from n8n webhook:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text that failed to parse:', responseText);
        // If JSON parsing fails, treat it as a plain text response
        responseData = [{ output: responseText }];
      }
      console.log('Received response from n8n webhook:', responseData);

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      
      // Return a fallback response when the webhook is unreachable
      return new Response(JSON.stringify([{ 
        output: "متأسفم، در حال حاضر سرویس در دسترس نیست. لطفاً بعداً دوباره تلاش کنید." 
      }]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 to prevent client-side error
      });
    }

  } catch (error) {
    console.error('Error in ai-coach-proxy:', error);
    return new Response(JSON.stringify([{ 
      output: "متأسفم، خطایی در پردازش درخواست رخ داد. لطفاً دوباره تلاش کنید." 
    }]), {
      status: 200, // Return 200 with error message instead of 500
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});