import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Humanizer } from '@/components/dashboard/Humanizer';

export default function Humanize() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Humanizer</h1>
          <p className="text-muted-foreground mt-1">
            Transform AI-generated content into natural, human-like writing.
          </p>
        </div>
        <Humanizer />
      </div>
    </DashboardLayout>
  );
}
