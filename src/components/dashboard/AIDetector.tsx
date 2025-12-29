import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { useDocuments } from '@/hooks/useDocuments';
import { Loader2, AlertCircle, CheckCircle, Target, Copy } from 'lucide-react';

interface DetectionResult {
  aiProbability: number;
  confidence: string;
  analysis: {
    patterns: string[];
    humanTraits: string[];
    suspiciousSections: string[];
  };
  summary: string;
}

export function AIDetector() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { toast } = useToast();
  const { credits, useCredits: deductCredits } = useCredits();
  const { saveDocument } = useDocuments();

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const creditCost = 1;

  const handleDetect = async () => {
    if (!text.trim()) {
      toast({
        title: 'Text required',
        description: 'Please enter some text to analyze.',
        variant: 'destructive',
      });
      return;
    }

    if (wordCount < 20) {
      toast({
        title: 'Text too short',
        description: 'Please enter at least 20 words for accurate analysis.',
        variant: 'destructive',
      });
      return;
    }

    if (credits < creditCost) {
      toast({
        title: 'Insufficient credits',
        description: 'You need at least 1 credit to run detection.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Detection failed');
      }

      const data = await response.json();
      setResult(data);

      // Deduct credits and save document
      await deductCredits(creditCost, 'AI Detection');
      await saveDocument({
        title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        original_text: text,
        ai_score: data.aiProbability,
        document_type: 'detection',
      });

      toast({
        title: 'Analysis complete',
        description: `AI probability: ${data.aiProbability}%`,
      });
    } catch (error) {
      console.error('Detection error:', error);
      toast({
        title: 'Detection failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-success';
    if (score < 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score < 30) return 'Likely Human';
    if (score < 60) return 'Mixed/Uncertain';
    return 'Likely AI';
  };

  return (
    <div className="space-y-6">
      {/* Input section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            AI Content Detector
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Paste or type your text here to analyze for AI-generated content..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] resize-none"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>{wordCount} words · {charCount} characters</span>
              <span>Cost: {creditCost} credit</span>
            </div>
          </div>
          
          <Button 
            onClick={handleDetect} 
            disabled={loading || !text.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Detect AI Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results section */}
      {result && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main score */}
            <div className="text-center p-6 bg-muted/50 rounded-xl">
              <div className={`text-5xl font-bold ${getScoreColor(result.aiProbability)}`}>
                {result.aiProbability}%
              </div>
              <p className="text-lg font-medium text-foreground mt-2">
                {getScoreLabel(result.aiProbability)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Confidence: {result.confidence}
              </p>
              <Progress 
                value={result.aiProbability} 
                className="mt-4 h-3"
              />
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-semibold text-foreground mb-2">Summary</h4>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>

            {/* Patterns found */}
            {result.analysis.patterns.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  AI Patterns Detected
                </h4>
                <ul className="space-y-1">
                  {result.analysis.patterns.map((pattern, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive">•</span>
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Human traits */}
            {result.analysis.humanTraits.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Human-like Traits
                </h4>
                <ul className="space-y-1">
                  {result.analysis.humanTraits.map((trait, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-success">•</span>
                      {trait}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suspicious sections */}
            {result.analysis.suspiciousSections.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Suspicious Sections</h4>
                <div className="space-y-2">
                  {result.analysis.suspiciousSections.map((section, i) => (
                    <blockquote 
                      key={i} 
                      className="border-l-2 border-warning pl-4 py-2 text-sm text-muted-foreground italic bg-warning/5 rounded-r"
                    >
                      "{section}"
                    </blockquote>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
