import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { useDocuments } from '@/hooks/useDocuments';
import { Loader2, PenTool, Copy, Check, CheckCircle2 } from 'lucide-react';

const focusOptions = [
  { id: 'grammar', label: 'Grammar & Spelling', description: 'Fix errors and typos' },
  { id: 'clarity', label: 'Clarity', description: 'Simplify complex sentences' },
  { id: 'flow', label: 'Flow & Transitions', description: 'Improve readability' },
  { id: 'tone', label: 'Professional Tone', description: 'Adjust for business context' },
  { id: 'conciseness', label: 'Conciseness', description: 'Remove redundancy' },
  { id: 'engagement', label: 'Engagement', description: 'Make it more compelling' },
];

export function WritingImprover() {
  const [text, setText] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>(['grammar', 'clarity', 'flow']);
  const [loading, setLoading] = useState(false);
  const [improvedText, setImprovedText] = useState('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { credits, useCredits: deductCredits } = useCredits();
  const { saveDocument } = useDocuments();

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const creditCost = Math.max(2, Math.ceil(wordCount / 80));

  const toggleFocus = (id: string) => {
    setFocusAreas((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleImprove = async () => {
    if (!text.trim()) {
      toast({
        title: 'Text required',
        description: 'Please enter some text to improve.',
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

    if (focusAreas.length === 0) {
      toast({
        title: 'Select focus areas',
        description: 'Please select at least one improvement area.',
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
    setImprovedText('');
    setImprovements([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/improve-writing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, focusAreas }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Improvement failed');
      }

      const data = await response.json();
      setImprovedText(data.improvedText);
      setImprovements(data.improvements || []);

      await deductCredits(creditCost, 'Writing Improvement');
      await saveDocument({
        title: `Improved: ${text.slice(0, 40)}${text.length > 40 ? '...' : ''}`,
        original_text: text,
        humanized_text: data.improvedText,
        document_type: 'improvement',
      });

      toast({
        title: 'Improvement complete',
        description: 'Your writing has been enhanced.',
      });
    } catch (error) {
      console.error('Improve error:', error);
      toast({
        title: 'Improvement failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(improvedText);
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
            <PenTool className="w-5 h-5 text-primary" />
            Essay & Writing Improver
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Textarea
              placeholder="Paste your essay, article, or any writing you want to improve..."
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

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Focus Areas</label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {focusOptions.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    focusAreas.includes(option.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleFocus(option.id)}
                >
                  <Checkbox
                    checked={focusAreas.includes(option.id)}
                    onCheckedChange={() => toggleFocus(option.id)}
                    disabled={loading}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleImprove} disabled={loading || !text.trim() || focusAreas.length === 0} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Improving...
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4 mr-2" />
                Improve Writing
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {improvedText && (
        <Card className="animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Improved Result</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <><Check className="w-4 h-4 mr-2" />Copied</> : <><Copy className="w-4 h-4 mr-2" />Copy</>}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Original
                </h4>
                <div className="p-4 bg-muted/50 rounded-lg min-h-[150px] text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {text}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Improved
                </h4>
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg min-h-[150px] text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {improvedText}
                </div>
              </div>
            </div>

            {improvements.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Improvements Made</h4>
                <div className="bg-muted/30 rounded-lg p-4">
                  <ul className="space-y-2">
                    {improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
