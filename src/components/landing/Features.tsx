import { Bot, FileText, History, Sparkles, Target, Zap } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'AI Detection',
    description: 'Analyze any text to determine if it was written by AI. Get detailed insights and probability scores.',
  },
  {
    icon: Sparkles,
    title: 'Smart Humanization',
    description: 'Transform AI content into natural, human-like writing while preserving the original meaning.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get analysis and transformation results in seconds with our advanced AI processing.',
  },
  {
    icon: FileText,
    title: 'Multiple Formats',
    description: 'Works with essays, articles, emails, and any text content you need to process.',
  },
  {
    icon: Bot,
    title: 'Bypass Detection',
    description: 'Our humanization techniques are designed to bypass major AI detection tools.',
  },
  {
    icon: History,
    title: 'Document History',
    description: 'Save and access your processed documents anytime with your personal dashboard.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to detect, analyze, and humanize AI-generated content.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
