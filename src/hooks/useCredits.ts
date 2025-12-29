import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setCredits(data?.credits ?? 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const useCredits = async (amount: number, description: string): Promise<boolean> => {
    if (!user) return false;
    if (credits < amount) return false;

    try {
      // Update credits
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: credits - amount })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          transaction_type: 'usage',
          description,
        });

      if (transactionError) console.error('Failed to log transaction:', transactionError);

      setCredits(prev => prev - amount);
      return true;
    } catch (error) {
      console.error('Error using credits:', error);
      return false;
    }
  };

  return { credits, loading, useCredits, refetch: fetchCredits };
}
