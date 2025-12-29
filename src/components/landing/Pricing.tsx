import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePricingPlans } from '@/hooks/useAdmin';
import { useCreatePayPalOrder } from '@/hooks/usePayment';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function Pricing() {
  const { data: plans, isLoading, error } = usePricingPlans();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createOrder = useCreatePayPalOrder();
  const { toast } = useToast();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return price === 0 ? '$0' : `$${price.toFixed(0)}`;
  };

  const handlePurchase = async (planId: string, price: number, planName: string) => {
    // Free plan - just redirect to auth
    if (price === 0) {
      navigate('/auth');
      return;
    }

    // Paid plan - check if user is logged in
    if (!user) {
      navigate(`/auth?redirect=pricing&plan=${planId}`);
      return;
    }

    // Initiate PayPal checkout
    setProcessingPlanId(planId);
    try {
      const baseUrl = window.location.origin;
      const result = await createOrder.mutateAsync({
        planId,
        returnUrl: `${baseUrl}/payment/success?planId=${planId}`,
        cancelUrl: `${baseUrl}/payment/cancel`,
      });

      if (result.approvalUrl) {
        window.location.href = result.approvalUrl;
      } else {
        throw new Error('No approval URL received');
      }
    } catch (err) {
      toast({
        title: 'Payment Error',
        description: err instanceof Error ? err.message : 'Failed to initiate payment',
        variant: 'destructive',
      });
      setProcessingPlanId(null);
    }
  };

  if (isLoading) {
    return (
      <section id="pricing" className="py-24 bg-secondary/30">
        <div className="container px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free and upgrade as you grow. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 rounded-2xl border border-border bg-card/50">
                <Skeleton className="h-6 w-20 mb-4" />
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-6" />
                <div className="space-y-3 mb-8">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !plans || plans.length === 0) {
    return (
      <section id="pricing" className="py-24 bg-secondary/30">
        <div className="container px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Pricing plans are currently unavailable. Please check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade as you grow. No hidden fees.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative p-8 rounded-2xl border ${
                plan.is_popular 
                  ? 'border-primary bg-card shadow-xl scale-105' 
                  : 'border-border bg-card/50'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/one-time</span>}
                  {plan.price === 0 && <span className="text-muted-foreground">/forever</span>}
                </div>
                {plan.description && (
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{plan.credits.toLocaleString()} credits</span>
                </li>
                {plan.features && Array.isArray(plan.features) && plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.price === 0 ? (
                <Button 
                  asChild 
                  className="w-full" 
                  variant="outline"
                >
                  <Link to="/auth">Get Started</Link>
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  variant={plan.is_popular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(plan.id, plan.price, plan.name)}
                  disabled={processingPlanId === plan.id}
                >
                  {processingPlanId === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Buy ${plan.name}`
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
