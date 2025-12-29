import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCapturePayPalOrder } from '@/hooks/usePayment';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const captureOrder = useCapturePayPalOrder();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [credits, setCredits] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const orderId = searchParams.get('token');
  const planId = searchParams.get('planId');

  useEffect(() => {
    if (!orderId || !planId) {
      setStatus('error');
      setErrorMessage('Missing payment information');
      return;
    }

    captureOrder.mutate(
      { orderId, planId },
      {
        onSuccess: (data) => {
          setStatus('success');
          setCredits(data.credits);
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          queryClient.invalidateQueries({ queryKey: ['credits'] });
        },
        onError: (error) => {
          setStatus('error');
          setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
        },
      }
    );
  }, [orderId, planId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Processing Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Your account has been credited with {credits} credits.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <div className="flex gap-4 justify-center mt-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
              <Button onClick={() => navigate('/#pricing')}>
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
