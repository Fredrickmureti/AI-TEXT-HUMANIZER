import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  FileText, 
  Linkedin, 
  Target, 
  MessageSquare, 
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const careerFeatures = [
  { icon: FileText, label: 'Resume Builder' },
  { icon: RefreshCw, label: 'CV Revamp' },
  { icon: Linkedin, label: 'LinkedIn Optimization' },
  { icon: Target, label: 'Job Tracking' },
  { icon: MessageSquare, label: 'Cover Letters' },
  { icon: Sparkles, label: 'AI Optimization' },
];

export function CareerTools() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Briefcase className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Partner Platform</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Take Your Career to the{' '}
                <span className="text-primary">Next Level</span>
              </h2>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Our partner platform <strong className="text-foreground">CreateResume.tech</strong> offers 
                comprehensive career tools to help you land your dream job. From AI-powered resume building 
                to LinkedIn optimization and job application tracking.
              </p>

              <div className="flex flex-wrap gap-3">
                {careerFeatures.map((feature) => (
                  <div 
                    key={feature.label}
                    className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg"
                  >
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{feature.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="group">
                  <a 
                    href="https://createresume.tech" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Explore Career Tools
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/auth">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="space-y-6">
                  {/* Mock resume preview */}
                  <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">CreateResume.tech</h3>
                      <p className="text-muted-foreground">Professional Career Platform</p>
                    </div>
                  </div>

                  {/* Feature highlights */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                      <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">AI Resume Builder</p>
                        <p className="text-sm text-muted-foreground">Create ATS-optimized resumes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Linkedin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">LinkedIn Optimizer</p>
                        <p className="text-sm text-muted-foreground">Stand out to recruiters</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                      <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Job Tracker</p>
                        <p className="text-sm text-muted-foreground">Manage applications efficiently</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">10k+</p>
                      <p className="text-xs text-muted-foreground">Resumes Created</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">95%</p>
                      <p className="text-xs text-muted-foreground">ATS Pass Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">Free</p>
                      <p className="text-xs text-muted-foreground">To Get Started</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-2xl blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-success/20 rounded-2xl blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
