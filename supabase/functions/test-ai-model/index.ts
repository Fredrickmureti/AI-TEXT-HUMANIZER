import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modelId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get model details
    const { data: model, error: modelError } = await supabase
      .from('ai_models')
      .select('*')
      .eq('id', modelId)
      .single();

    if (modelError || !model) {
      throw new Error('Model not found');
    }

    let apiKey = model.api_key_encrypted;
    let endpoint = model.api_endpoint;

    // For Lovable provider, use the default key
    if (model.provider === 'lovable') {
      apiKey = Deno.env.get('LOVABLE_API_KEY');
      endpoint = 'https://ai.gateway.lovable.dev/v1/chat/completions';
    }

    if (!apiKey) {
      throw new Error('API key not configured for this model');
    }

    // Test the model with a simple request
    const testResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model_id,
        messages: [
          { role: 'user', content: 'Hello, respond with "OK" if you can hear me.' }
        ],
        max_tokens: 10,
      }),
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('Model test error:', testResponse.status, errorText);
      
      // Update model error status
      await supabase
        .from('ai_models')
        .update({
          last_error: `HTTP ${testResponse.status}: ${errorText.slice(0, 200)}`,
          last_error_at: new Date().toISOString(),
          error_count: model.error_count + 1,
        })
        .eq('id', modelId);

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Connection failed: HTTP ${testResponse.status}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await testResponse.json();
    const responseContent = data.choices?.[0]?.message?.content;

    // Update success count
    await supabase
      .from('ai_models')
      .update({
        success_count: model.success_count + 1,
        last_error: null,
        last_error_at: null,
      })
      .eq('id', modelId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Model responded: "${responseContent?.slice(0, 50) || 'OK'}"` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in test-ai-model:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Test failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
