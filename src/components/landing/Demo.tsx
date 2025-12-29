import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Loader2 } from 'lucide-react';

export function Demo() {
  const [originalText] = useState(
    `Artificial intelligence has revolutionized the way we interact with technology. Machine learning algorithms are capable of processing vast amounts of data to identify patterns and make predictions. This technological advancement has significant implications for various industries, including healthcare, finance, and transportation. The integration of AI systems into everyday applications demonstrates the transformative potential of this technology.`
  );
  
  const [humanizedText] = useState(
    `I've been thinking a lot about how AI has changed everything, honestly. Like, these machine learning systems? They crunch through massive datasets and somehow figure out patterns we'd never catch. Pretty wild when you think about it. And it's not just tech companies using this stuff – hospitals, banks, even how we get around cities is being transformed. The way AI has woven itself into apps we use daily really shows how powerful this technology has become.`
  );

  return (
    <section className="py-24">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See the Difference
          </h2>
          <p className="text-lg text-muted-foreground">
            Watch how AI-generated text transforms into natural, human writing.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original text */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">AI Generated</h3>
                <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm rounded-full font-medium">
                  87% AI Detected
                </span>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border border-border min-h-[200px]">
                <p className="text-foreground/80 leading-relaxed">{originalText}</p>
              </div>
            </div>
            
            {/* Arrow for desktop */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            
            {/* Humanized text */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Humanized</h3>
                <span className="px-3 py-1 bg-success/10 text-success text-sm rounded-full font-medium">
                  12% AI Detected
                </span>
              </div>
              <div className="p-4 bg-success/5 rounded-xl border border-success/20 min-h-[200px]">
                <p className="text-foreground/80 leading-relaxed">{humanizedText}</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="h-12 px-8">
              <a href="/auth">
                Try It Yourself
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
