import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { WritingImprover } from '@/components/dashboard/WritingImprover';

export default function ImproveWriting() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Essay & Writing Improver</h1>
          <p className="text-muted-foreground">
            Enhance your essays, articles, and writing with AI-powered improvements.
          </p>
        </div>
        <WritingImprover />
      </div>
    </DashboardLayout>
  );
}
