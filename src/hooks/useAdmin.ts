import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  api_key_encrypted: string | null;
  api_endpoint: string | null;
  is_active: boolean;
  priority: number;
  is_default: boolean;
  rate_limit_per_minute: number;
  last_error: string | null;
  last_error_at: string | null;
  success_count: number;
  error_count: number;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  credits: number;
  created_at: string;
}

export function useIsAdmin() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user,
  });
}

export function usePricingPlans() {
  return useQuery({
    queryKey: ['pricingPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as PricingPlan[];
    },
  });
}

export function useAdminPricingPlans() {
  return useQuery({
    queryKey: ['adminPricingPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as PricingPlan[];
    },
  });
}

export function useUpdatePricingPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (plan: Partial<PricingPlan> & { id: string }) => {
      const { error } = await supabase
        .from('pricing_plans')
        .update(plan)
        .eq('id', plan.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPricingPlans'] });
      queryClient.invalidateQueries({ queryKey: ['pricingPlans'] });
      toast({ title: 'Pricing plan updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update pricing plan', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useCreatePricingPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (plan: Omit<PricingPlan, 'id'>) => {
      const { error } = await supabase
        .from('pricing_plans')
        .insert(plan);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPricingPlans'] });
      queryClient.invalidateQueries({ queryKey: ['pricingPlans'] });
      toast({ title: 'Pricing plan created successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to create pricing plan', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useDeletePricingPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPricingPlans'] });
      queryClient.invalidateQueries({ queryKey: ['pricingPlans'] });
      toast({ title: 'Pricing plan deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to delete pricing plan', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useAIModels() {
  return useQuery({
    queryKey: ['aiModels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as AIModel[];
    },
  });
}

export function useUpdateAIModel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (model: Partial<AIModel> & { id: string }) => {
      const { error } = await supabase
        .from('ai_models')
        .update(model)
        .eq('id', model.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiModels'] });
      toast({ title: 'AI model updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update AI model', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useCreateAIModel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (model: Omit<AIModel, 'id' | 'last_error' | 'last_error_at' | 'success_count' | 'error_count'>) => {
      const { error } = await supabase
        .from('ai_models')
        .insert(model);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiModels'] });
      toast({ title: 'AI model created successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to create AI model', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useDeleteAIModel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_models')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiModels'] });
      toast({ title: 'AI model deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to delete AI model', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
  });
}

export function useTestAIModel() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (modelId: string) => {
      const response = await supabase.functions.invoke('test-ai-model', {
        body: { modelId },
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast({ 
        title: data.success ? 'Connection successful' : 'Connection failed',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Test failed', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}
