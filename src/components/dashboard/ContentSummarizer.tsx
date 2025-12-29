import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { useDocuments } from '@/hooks/useDocuments';
import { Loader2, FileText, Copy, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SummaryLength = 'brief' | 'moderate' | 'detailed';
type SummaryFormat = 'paragraph' | 'bullets' | 'numbered';

export function ContentSummarizer() {
  const [text, setText] = useState('');
  const [length, setLength] = useState<SummaryLength>('moderate');
  const [format, setFormat] = useState<SummaryFormat>('paragraph');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { credits, useCredits: deductCredits } = useCredits();
  const { saveDocument } = useDocuments();

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const creditCost = Math.max(1, Math.ceil(wordCount / 150));

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast({
        title: 'Text required',
        description: 'Please enter some text to summarize.',
        variant: 'destructive',
      });
      return;
    }

    if (wordCount < 30) {
      toast({
        title: 'Text too short',
        description: 'Please enter at least 30 words for a meaningful summary.',
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
    setSummary('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, length, format }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Summarization failed');
      }

      const data = await response.json();
      setSummary(data.summary);

      await deductCredits(creditCost, `Summary (${length})`);
      await saveDocument({
        title: `Summary: ${text.slice(0, 40)}${text.length > 40 ? '...' : ''}`,
        original_text: text,
        humanized_text: data.summary,
        document_type: 'summary',
      });

      toast({
        title: 'Summarization complete',
        description: 'Your content has been summarized.',
      });
    } catch (error) {
      console.error('Summarize error:', error);
      toast({
        title: 'Summarization failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
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
            <FileText className="w-5 h-5 text-primary" />
            AI Content Summarizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Textarea
              placeholder="Paste the article, document, or content you want to summarize..."
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Summary Length</label>
              <Select value={length} onValueChange={(v) => setLength(v as SummaryLength)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief (2-3 sentences)</SelectItem>
                  <SelectItem value="moderate">Moderate (1 paragraph)</SelectItem>
                  <SelectItem value="detailed">Detailed (comprehensive)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Output Format</label>
              <Select value={format} onValueChange={(v) => setFormat(v as SummaryFormat)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraph">Paragraph</SelectItem>
                  <SelectItem value="bullets">Bullet Points</SelectItem>
                  <SelectItem value="numbered">Numbered List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSummarize} disabled={loading || !text.trim()} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Summarize Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card className="animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Summary Result</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <><Check className="w-4 h-4 mr-2" />Copied</> : <><Copy className="w-4 h-4 mr-2" />Copy</>}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {summary}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Original: {wordCount} words</span>
              <span>→</span>
              <span>Summary: {summary.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span className="text-primary">
                ({Math.round((1 - summary.trim().split(/\s+/).filter(Boolean).length / wordCount) * 100)}% reduction)
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
