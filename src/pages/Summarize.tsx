import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ContentSummarizer } from '@/components/dashboard/ContentSummarizer';

export default function Summarize() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Content Summarizer</h1>
          <p className="text-muted-foreground">
            Condense long articles, documents, or any content into concise summaries.
          </p>
        </div>
        <ContentSummarizer />
      </div>
    </DashboardLayout>
  );
}
