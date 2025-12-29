import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Text Transformation</span>
          </div>
          
          {/* Main heading */}
          <h1 className="animate-slide-up text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-balance">
            Make AI Text{' '}
            <span className="text-primary">Undetectable</span>
          </h1>
          
          {/* Subheading */}
          <p className="animate-slide-up text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance" style={{ animationDelay: '0.1s' }}>
            Transform AI-generated content into natural, human-like writing that bypasses detection tools. 
            Detect AI content with precision and humanize it with one click.
          </p>
          
          {/* CTA Buttons */}
          <div className="animate-slide-up flex flex-col sm:flex-row items-center justify-center gap-4 pt-4" style={{ animationDelay: '0.2s' }}>
            <Button asChild size="lg" className="h-12 px-8 text-base font-medium">
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
              <a href="#features">
                See How It Works
              </a>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="animate-fade-in flex flex-wrap items-center justify-center gap-8 pt-12 text-muted-foreground" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              <span className="text-sm">100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">✓ 100 Free Credits</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">✓ No Credit Card Required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
