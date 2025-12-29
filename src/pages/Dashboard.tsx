import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/hooks/useCredits';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/lib/auth';
import { Link } from 'react-router-dom';
import { Target, Wand2, FileText, Coins, ArrowRight, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { credits } = useCredits();
  const { documents } = useDocuments();

  const recentDocs = documents.slice(0, 5);
  const detectionCount = documents.filter(d => d.document_type === 'detection' || d.document_type === 'both').length;
  const humanizationCount = documents.filter(d => d.document_type === 'humanization' || d.document_type === 'both').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your account and recent activity.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="text-2xl font-bold text-foreground">{credits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Detections</p>
                  <p className="text-2xl font-bold text-foreground">{detectionCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Humanizations</p>
                  <p className="text-2xl font-bold text-foreground">{humanizationCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <FileText className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold text-foreground">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="group hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">AI Detector</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Analyze text to determine if it was written by AI
                  </p>
                </div>
                <Button asChild variant="ghost" size="icon">
                  <Link to="/dashboard/detect">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                    <Wand2 className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">Humanizer</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Transform AI content into natural human writing
                  </p>
                </div>
                <Button asChild variant="ghost" size="icon">
                  <Link to="/dashboard/humanize">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Documents</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/history">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentDocs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No documents yet. Start by detecting or humanizing some text!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocs.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      doc.document_type === 'detection' 
                        ? 'bg-primary/10' 
                        : doc.document_type === 'humanization' 
                        ? 'bg-success/10' 
                        : 'bg-secondary'
                    }`}>
                      {doc.document_type === 'detection' ? (
                        <Target className="w-5 h-5 text-primary" />
                      ) : doc.document_type === 'humanization' ? (
                        <Wand2 className="w-5 h-5 text-success" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {doc.title || 'Untitled'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                        {doc.ai_score !== null && ` · ${doc.ai_score}% AI`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
