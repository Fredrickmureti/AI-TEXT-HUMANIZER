import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { useCredits } from '@/hooks/useCredits';
import { usePricingPlans } from '@/hooks/useAdmin';
import { useCreatePayPalOrder } from '@/hooks/usePayment';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, CreditCard, Bell, Shield, Check } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { credits } = useCredits();
  const { data: plans, isLoading: plansLoading } = usePricingPlans();
  const createOrder = useCreatePayPalOrder();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');

  const handlePurchase = async (planId: string, planName: string) => {
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

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      
      toast({ title: 'Profile updated successfully' });
    } catch (error) {
      toast({ 
        title: 'Failed to update profile', 
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Profile section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={user?.email || ''} 
                disabled 
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Credits section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle>Credits & Billing</CardTitle>
                <CardDescription>Manage your credits and subscription</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-foreground">{credits} credits</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-4">Buy More Credits</h4>
              {plansLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              ) : plans && plans.filter(p => p.price > 0).length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {plans.filter(p => p.price > 0).map((plan) => (
                    <div 
                      key={plan.id}
                      className={`p-4 rounded-lg border ${
                        plan.is_popular ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      {plan.is_popular && (
                        <span className="text-xs font-medium text-primary mb-2 block">Most Popular</span>
                      )}
                      <h5 className="font-semibold text-foreground">{plan.name}</h5>
                      <p className="text-2xl font-bold text-foreground mt-1">${plan.price}</p>
                      <p className="text-sm text-muted-foreground mt-1">{plan.credits.toLocaleString()} credits</p>
                      <ul className="mt-3 space-y-1">
                        {plan.features && Array.isArray(plan.features) && plan.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full mt-4" 
                        variant={plan.is_popular ? 'default' : 'outline'}
                        onClick={() => handlePurchase(plan.id, plan.name)}
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No credit packages available at the moment.</p>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Credits are used for AI detection (1 credit) and humanization (2-5 credits based on length).
            </p>
          </CardContent>
        </Card>

        {/* Security section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted-foreground">Change your password</p>
              </div>
              <Button variant="outline">Update Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-success" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Email notifications settings coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
