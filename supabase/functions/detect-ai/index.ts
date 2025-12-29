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

async function callModel(model: AIModel, messages: any[], temperature: number = 0.3): Promise<{ success: boolean; data?: any; error?: string }> {
  let apiKey = model.api_key_encrypted;
  let endpoint = model.api_endpoint || 'https://ai.gateway.lovable.dev/v1/chat/completions';

  // For Lovable provider, use the default key
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

async function updateModelStats(supabase: any, modelId: string, success: boolean, error?: string) {
  if (success) {
    await supabase
      .from('ai_models')
      .update({ success_count: supabase.sql`success_count + 1` })
      .eq('id', modelId);
  } else {
    await supabase
      .from('ai_models')
      .update({
        error_count: supabase.sql`error_count + 1`,
        last_error: error,
        last_error_at: new Date().toISOString(),
      })
      .eq('id', modelId);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
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
      // Fallback to default Lovable AI
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

    const systemPrompt = `You are an expert AI content detector. Analyze the provided text and determine whether it was written by AI or a human.

Your analysis should consider:
1. Repetitive sentence structures and patterns
2. Overly formal or consistent tone throughout
3. Lack of personal anecdotes or emotional depth
4. Perfect grammar and punctuation (humans make mistakes)
5. Generic phrases and filler content
6. Predictable transitions and conclusions
7. Absence of unique voice or personality
8. Statistical patterns in word choice and sentence length

You MUST respond with a valid JSON object in this exact format:
{
  "aiProbability": <number between 0 and 100>,
  "confidence": "<low|medium|high>",
  "analysis": {
    "patterns": ["<list of AI-like patterns found>"],
    "humanTraits": ["<list of human-like traits found>"],
    "suspiciousSections": ["<quoted sections that appear AI-generated>"]
  },
  "summary": "<2-3 sentence explanation of the verdict>"
}

Be accurate and thorough in your analysis.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this text for AI detection:\n\n${text}` }
    ];

    // Try models with fallback
    let lastError = '';
    for (const model of models) {
      console.log(`Trying model: ${model.name} (${model.model_id})`);
      
      const result = await callModel(model, messages, 0.3);
      
      if (result.success && result.data) {
        if (model.id !== 'default') {
          // Update success stats (fire and forget)
          supabase
            .from('ai_models')
            .update({ success_count: model.success_count + 1 })
            .eq('id', model.id)
            .then(() => {});
        }

        const content = result.data.choices?.[0]?.message?.content;
        
        if (!content) {
          lastError = 'No response from AI';
          continue;
        }

        // Parse the JSON response
        let parsed;
        try {
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
          const jsonStr = jsonMatch ? jsonMatch[1] : content;
          parsed = JSON.parse(jsonStr.trim());
        } catch (parseError) {
          console.error('Failed to parse AI response:', content);
          parsed = {
            aiProbability: 50,
            confidence: 'low',
            analysis: { patterns: [], humanTraits: [], suspiciousSections: [] },
            summary: 'Unable to determine with confidence. The text shows mixed characteristics.'
          };
        }

        return new Response(
          JSON.stringify(parsed),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      lastError = result.error || 'Unknown error';
      console.log(`Model ${model.name} failed: ${lastError}, trying next...`);
      
      if (model.id !== 'default') {
        // Update error stats (fire and forget)
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

    // All models failed
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
    console.error('Error in detect-ai function:', error);
    const message = error instanceof Error ? error.message : 'Detection failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
