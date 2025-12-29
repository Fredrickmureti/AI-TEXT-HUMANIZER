import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AIDetector } from '@/components/dashboard/AIDetector';

export default function Detect() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Detector</h1>
          <p className="text-muted-foreground mt-1">
            Analyze any text to determine if it was written by AI.
          </p>
        </div>
        <AIDetector />
      </div>
    </DashboardLayout>
  );
}
