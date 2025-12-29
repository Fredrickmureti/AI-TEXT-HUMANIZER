import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemSetting {
  id: string;
  key: string;
  value: number | string | boolean | object;
  created_at: string;
  updated_at: string;
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;
      return data as SystemSetting[];
    },
  });
}

export function useSystemSetting(key: string) {
  return useQuery({
    queryKey: ['systemSetting', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
        .maybeSingle();
      
      if (error) throw error;
      return data as SystemSetting | null;
    },
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: number | string | boolean | object }) => {
      // Try to update first
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: value as any })
          .eq('key', key);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_settings')
          .insert({ key, value: value as any });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      queryClient.invalidateQueries({ queryKey: ['systemSetting'] });
      toast({ title: 'Setting updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update setting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
