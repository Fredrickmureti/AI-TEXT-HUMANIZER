import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <XCircle className="w-16 h-16 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <Button onClick={() => navigate('/#pricing')}>
            View Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
