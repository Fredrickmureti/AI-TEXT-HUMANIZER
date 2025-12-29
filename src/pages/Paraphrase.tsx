import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SmartParaphraser } from '@/components/dashboard/SmartParaphraser';

export default function Paraphrase() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Smart Paraphraser</h1>
          <p className="text-muted-foreground">
            Rewrite your text with different styles while preserving the original meaning.
          </p>
        </div>
        <SmartParaphraser />
      </div>
    </DashboardLayout>
  );
}
