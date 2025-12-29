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
    const { text, focusAreas } = await req.json();

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

    const areas = focusAreas || ['grammar', 'clarity', 'flow'];
    
    const focusInstructions = {
      grammar: 'Fix all grammatical errors, punctuation, and spelling mistakes.',
      clarity: 'Improve clarity by simplifying complex sentences and removing ambiguity.',
      flow: 'Enhance the flow and transitions between sentences and paragraphs.',
      tone: 'Adjust the tone to be more professional and appropriate for the context.',
      conciseness: 'Make the writing more concise by removing unnecessary words and redundancy.',
      engagement: 'Make the writing more engaging and compelling to read.',
    };

    const selectedInstructions = areas
      .map((area: string) => focusInstructions[area as keyof typeof focusInstructions])
      .filter(Boolean)
      .join('\n- ');

    const systemPrompt = `You are an expert writing editor and improver. Your task is to enhance the given text while:

Focus Areas:
- ${selectedInstructions}

Guidelines:
1. Preserve the original meaning and intent of the writing
2. Maintain the author's voice while improving quality
3. Make the text more polished and professional
4. Ensure the improvements are natural and not overly formal unless requested
5. Fix any issues without changing the content's core message

Return the improved text followed by a brief section with "---IMPROVEMENTS---" marker that lists the key improvements made (in bullet points).`;

    console.log(`Improving writing with focus on: ${areas.join(', ')}...`);

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
          { role: 'user', content: `Please improve the following text:\n\n${text}` }
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
      throw new Error('Failed to improve writing');
    }

    const data = await response.json();
    const fullResponse = data.choices?.[0]?.message?.content;

    if (!fullResponse) {
      throw new Error('No response from AI');
    }

    // Split the response into improved text and improvements list
    let improvedText = fullResponse;
    let improvements: string[] = [];

    if (fullResponse.includes('---IMPROVEMENTS---')) {
      const parts = fullResponse.split('---IMPROVEMENTS---');
      improvedText = parts[0].trim();
      const improvementSection = parts[1]?.trim() || '';
      improvements = improvementSection
        .split('\n')
        .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
        .filter((line: string) => line.length > 0);
    }

    console.log('Writing improvement complete');

    return new Response(
      JSON.stringify({ improvedText, improvements }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in improve-writing function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
