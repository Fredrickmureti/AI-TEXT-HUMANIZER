import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  api_key_encrypted: string | null;
  api_endpoint: string | null;
  is_active: boolean;
  priority: number;
  is_default: boolean;
  success_count: number;
  error_count: number;
}

async function getActiveModels(supabase: any): Promise<AIModel[]> {
  const { data, error } = await supabase
    .from('ai_models')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true });
  
  if (error) {
    console.error('Error fetching models:', error);
    return [];
  }
  
  return data || [];
}

async function callModel(model: AIModel, messages: any[], temperature: number = 0.8): Promise<{ success: boolean; data?: any; error?: string }> {
  let apiKey = model.api_key_encrypted;
  let endpoint = model.api_endpoint || 'https://ai.gateway.lovable.dev/v1/chat/completions';

  if (model.provider === 'lovable') {
    apiKey = Deno.env.get('LOVABLE_API_KEY') || null;
    endpoint = 'https://ai.gateway.lovable.dev/v1/chat/completions';
  }

  if (!apiKey) {
    return { success: false, error: 'No API key configured' };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.model_id,
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Model ${model.name} error:`, response.status, errorText);
      
      if (response.status === 429) {
        return { success: false, error: 'Rate limit exceeded' };
      }
      if (response.status === 402) {
        return { success: false, error: 'Credits exhausted' };
      }
      
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`Model ${model.name} exception:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, strength = 'medium' } = await req.json();
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const models = await getActiveModels(supabase);
    
    if (models.length === 0) {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('No AI models configured');
      }
      models.push({
        id: 'default',
        name: 'Default',
        provider: 'lovable',
        model_id: 'google/gemini-2.5-flash',
        api_key_encrypted: LOVABLE_API_KEY,
        api_endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
        is_active: true,
        priority: 0,
        is_default: true,
        success_count: 0,
        error_count: 0,
      });
    }

    const strengthInstructions: Record<string, string> = {
      light: `Make subtle changes only:
- Fix minor repetitive patterns
- Add occasional contractions
- Introduce 1-2 colloquial expressions
- Keep most of the original structure intact`,
      medium: `Make moderate changes:
- Vary sentence structures more significantly
- Add natural imperfections (minor grammar variations that humans make)
- Include casual language and transitions
- Break up overly formal sections
- Add personal touches and voice`,
      strong: `Make significant changes while preserving meaning:
- Completely restructure sentences
- Add personal anecdotes, rhetorical questions, and opinions
- Use varied vocabulary with occasional unusual word choices
- Include natural tangents and conversational elements
- Add emotional undertones and personality
- Introduce stylistic quirks a human writer might have`
    };

    const systemPrompt = `You are an expert at rewriting AI-generated text to sound authentically human. Your goal is to transform the text so it would pass AI detection tools while maintaining the original meaning.

${strengthInstructions[strength] || strengthInstructions.medium}

Key techniques to apply:
1. Vary sentence length unpredictably (mix very short with longer ones)
2. Use contractions naturally (don't, won't, it's)
3. Add filler words occasionally (well, actually, honestly)
4. Include minor imperfections humans naturally make
5. Break conventional structure with fragments or run-ons
6. Add personality and voice throughout
7. Use active voice more often
8. Include rhetorical questions or direct reader address
9. Add transitions that feel natural, not formulaic

IMPORTANT: Return ONLY the rewritten text, nothing else. Do not include explanations, notes, or formatting. Just the humanized version of the text.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Rewrite this text to sound human:\n\n${text}` }
    ];

    // Try models with fallback
    let lastError = '';
    for (const model of models) {
      console.log(`Trying model: ${model.name} (${model.model_id})`);
      
      const result = await callModel(model, messages, 0.8);
      
      if (result.success && result.data) {
        if (model.id !== 'default') {
          supabase
            .from('ai_models')
            .update({ success_count: model.success_count + 1 })
            .eq('id', model.id)
            .then(() => {});
        }

        const humanizedText = result.data.choices?.[0]?.message?.content;
        
        if (!humanizedText) {
          lastError = 'No response from AI';
          continue;
        }

        return new Response(
          JSON.stringify({ humanizedText: humanizedText.trim() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      lastError = result.error || 'Unknown error';
      console.log(`Model ${model.name} failed: ${lastError}, trying next...`);
      
      if (model.id !== 'default') {
        supabase
          .from('ai_models')
          .update({
            error_count: model.error_count + 1,
            last_error: lastError,
            last_error_at: new Date().toISOString(),
          })
          .eq('id', model.id)
          .then(() => {});
      }
    }

    if (lastError.includes('Rate limit')) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (lastError.includes('Credits exhausted')) {
      return new Response(
        JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    throw new Error('All AI models failed: ' + lastError);

  } catch (error) {
    console.error('Error in humanize-text function:', error);
    const message = error instanceof Error ? error.message : 'Humanization failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
