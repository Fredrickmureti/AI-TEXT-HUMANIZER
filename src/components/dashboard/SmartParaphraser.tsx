import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { useDocuments } from '@/hooks/useDocuments';
import { Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ParaphraseStyle = 'standard' | 'formal' | 'casual' | 'simplified' | 'creative';

const styleDescriptions: Record<ParaphraseStyle, string> = {
  standard: 'Balanced rewrite maintaining original tone',
  formal: 'Professional and academic tone',
  casual: 'Friendly and conversational',
  simplified: 'Easier words and shorter sentences',
  creative: 'Engaging and expressive language',
};

export function SmartParaphraser() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState<ParaphraseStyle>('standard');
  const [loading, setLoading] = useState(false);
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { credits, useCredits: deductCredits } = useCredits();
  const { saveDocument } = useDocuments();

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const creditCost = Math.max(1, Math.ceil(wordCount / 100));

  const handleParaphrase = async () => {
    if (!text.trim()) {
      toast({
        title: 'Text required',
        description: 'Please enter some text to paraphrase.',
        variant: 'destructive',
      });
      return;
    }

    if (wordCount < 5) {
      toast({
        title: 'Text too short',
        description: 'Please enter at least 5 words.',
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
    setParaphrasedText('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paraphrase-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, style }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Paraphrasing failed');
      }

      const data = await response.json();
      setParaphrasedText(data.paraphrasedText);

      await deductCredits(creditCost, `Paraphrase (${style})`);
      await saveDocument({
        title: `Paraphrase: ${text.slice(0, 40)}${text.length > 40 ? '...' : ''}`,
        original_text: text,
        humanized_text: data.paraphrasedText,
        document_type: 'paraphrase',
      });

      toast({
        title: 'Paraphrasing complete',
        description: 'Your text has been rewritten.',
      });
    } catch (error) {
      console.error('Paraphrase error:', error);
      toast({
        title: 'Paraphrasing failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paraphrasedText);
      setCopied(true);
      toast({ title: 'Copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Smart Paraphraser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Textarea
              placeholder="Enter the text you want to paraphrase..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[180px] resize-none"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>{wordCount} words · {charCount} characters</span>
              <span>Cost: {creditCost} credits</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Paraphrase Style</label>
            <Select value={style} onValueChange={(v) => setStyle(v as ParaphraseStyle)} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(styleDescriptions) as ParaphraseStyle[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    <div className="flex flex-col">
                      <span className="capitalize">{s}</span>
                      <span className="text-xs text-muted-foreground">{styleDescriptions[s]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleParaphrase} disabled={loading || !text.trim()} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Paraphrasing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Paraphrase Text
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {paraphrasedText && (
        <Card className="animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Paraphrased Result</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <><Check className="w-4 h-4 mr-2" />Copied</> : <><Copy className="w-4 h-4 mr-2" />Copy</>}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Original
                </h4>
                <div className="p-4 bg-muted/50 rounded-lg min-h-[120px] text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {text}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Paraphrased
                </h4>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg min-h-[120px] text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {paraphrasedText}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
