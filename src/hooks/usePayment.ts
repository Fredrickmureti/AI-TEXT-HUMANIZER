import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export function useCreatePayPalOrder() {
  return useMutation({
    mutationFn: async ({ planId, returnUrl, cancelUrl }: { 
      planId: string; 
      returnUrl: string; 
      cancelUrl: string;
    }) => {
      const response = await supabase.functions.invoke('create-paypal-order', {
        body: { planId, returnUrl, cancelUrl },
      });
      
      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);
      
      return response.data as { orderId: string; approvalUrl: string };
    },
  });
}

export function useCapturePayPalOrder() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ orderId, planId }: { orderId: string; planId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await supabase.functions.invoke('capture-paypal-order', {
        body: { orderId, planId, userId: user.id },
      });
      
      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);
      
      return response.data as { success: boolean; credits: number; orderId: string };
    },
  });
}
