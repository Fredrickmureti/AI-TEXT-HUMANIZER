import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, style } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const styleInstructions: Record<string, string> = {
      standard: 'Maintain the original meaning while using different words and sentence structures.',
      formal: 'Rewrite in a formal, professional tone suitable for business or academic contexts.',
      casual: 'Rewrite in a casual, conversational tone that feels friendly and approachable.',
      simplified: 'Rewrite using simpler words and shorter sentences for easier understanding.',
      creative: 'Rewrite with more creative and engaging language while preserving the core message.',
    };

    const systemPrompt = `You are an expert paraphrasing assistant. Your task is to rewrite the given text while:
1. ${styleInstructions[style] || styleInstructions.standard}
2. Preserving the original meaning and key information
3. Using different vocabulary and sentence structures
4. Maintaining natural, fluent language
5. Avoiding plagiarism by creating genuinely original phrasing

Return ONLY the paraphrased text without any additional commentary or explanations.`;

    console.log(`Paraphrasing text with style: ${style}...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please paraphrase the following text:\n\n${text}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to paraphrase text');
    }

    const data = await response.json();
    const paraphrasedText = data.choices?.[0]?.message?.content;

    if (!paraphrasedText) {
      throw new Error('No response from AI');
    }

    console.log('Paraphrasing complete');

    return new Response(
      JSON.stringify({ paraphrasedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in paraphrase-text function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
