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
    const { orderId, planId, userId } = await req.json();

    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials not configured');
    }

    // Get access token from PayPal (Live environment)
    const authResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with PayPal');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Capture the payment (Live environment)
    const captureResponse = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!captureResponse.ok) {
      const errorText = await captureResponse.text();
      console.error('PayPal capture error:', errorText);
      throw new Error('Failed to capture PayPal payment');
    }

    const captureData = await captureResponse.json();
    
    if (captureData.status !== 'COMPLETED') {
      throw new Error('Payment not completed');
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    const capture = captureData.purchase_units[0].payments.captures[0];

    // Create payment transaction record
    const { error: txError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        plan_id: planId,
        amount: parseFloat(capture.amount.value),
        currency: capture.amount.currency_code,
        payment_provider: 'paypal',
        payment_id: orderId,
        payer_id: captureData.payer?.payer_id || null,
        status: 'completed',
      });

    if (txError) {
      console.error('Transaction insert error:', txError);
    }

    // Add credits to user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error('User profile not found');
    }

    const newCredits = (profile.credits || 0) + plan.credits;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update credits');
    }

    // Record credit transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: plan.credits,
        transaction_type: 'purchase',
        description: `Purchased ${plan.name} plan via PayPal`,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        credits: newCredits,
        orderId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in capture-paypal-order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to capture payment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
