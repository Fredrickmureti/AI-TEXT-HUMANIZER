import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { useDocuments } from '@/hooks/useDocuments';
import { Loader2, Wand2, Copy, Check, ArrowRight } from 'lucide-react';

type Strength = 'light' | 'medium' | 'strong';

export function Humanizer() {
  const [text, setText] = useState('');
  const [strength, setStrength] = useState<Strength>('medium');
  const [loading, setLoading] = useState(false);
  const [humanizedText, setHumanizedText] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { credits, useCredits: deductCredits } = useCredits();
  const { saveDocument } = useDocuments();

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const creditCost = Math.max(2, Math.ceil(wordCount / 100));

  const strengthLabels: Record<Strength, string> = {
    light: 'Light - Subtle changes',
    medium: 'Medium - Balanced',
    strong: 'Strong - Major rewrite',
  };

  const handleStrengthChange = (value: number[]) => {
    const strengths: Strength[] = ['light', 'medium', 'strong'];
    setStrength(strengths[value[0]]);
  };

  const getStrengthValue = (): number => {
    const map: Record<Strength, number> = { light: 0, medium: 1, strong: 2 };
    return map[strength];
  };

  const handleHumanize = async () => {
    if (!text.trim()) {
      toast({
        title: 'Text required',
        description: 'Please enter some text to humanize.',
        variant: 'destructive',
      });
      return;
    }

    if (wordCount < 10) {
      toast({
        title: 'Text too short',
        description: 'Please enter at least 10 words.',
        variant: 'destructive',
      });
      return;
    }

    if (credits < creditCost) {
      toast({
        title: 'Insufficient credits',
        description: `You need at least ${creditCost} credits.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setHumanizedText('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/humanize-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, strength }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Humanization failed');
      }

      const data = await response.json();
      setHumanizedText(data.humanizedText);

      // Deduct credits and save document
      await deductCredits(creditCost, `Humanization (${strength})`);
      await saveDocument({
        title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        original_text: text,
        humanized_text: data.humanizedText,
        document_type: 'humanization',
      });

      toast({
        title: 'Humanization complete',
        description: 'Your text has been transformed.',
      });
    } catch (error) {
      console.error('Humanization error:', error);
      toast({
        title: 'Humanization failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(humanizedText);
      setCopied(true);
      toast({ title: 'Copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Input section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Text Humanizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Textarea
              placeholder="Paste your AI-generated text here to humanize it..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] resize-none"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>{wordCount} words · {charCount} characters</span>
              <span>Cost: {creditCost} credits</span>
            </div>
          </div>

          {/* Strength slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Humanization Strength</label>
              <span className="text-sm text-muted-foreground">{strengthLabels[strength]}</span>
            </div>
            <Slider
              value={[getStrengthValue()]}
              onValueChange={handleStrengthChange}
              min={0}
              max={2}
              step={1}
              disabled={loading}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Light</span>
              <span>Medium</span>
              <span>Strong</span>
            </div>
          </div>
          
          <Button 
            onClick={handleHumanize} 
            disabled={loading || !text.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Humanizing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Humanize Text
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results section */}
      {humanizedText && (
        <Card className="animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Humanized Result</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  Original
                </h4>
                <div className="p-4 bg-muted/50 rounded-lg min-h-[150px] text-sm text-foreground/80 leading-relaxed">
                  {text}
                </div>
              </div>

              {/* Arrow for desktop */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              {/* Humanized */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Humanized
                </h4>
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg min-h-[150px] text-sm text-foreground/80 leading-relaxed">
                  {humanizedText}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
