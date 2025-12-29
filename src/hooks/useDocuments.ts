import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface Document {
  id: string;
  title: string | null;
  original_text: string;
  humanized_text: string | null;
  ai_score: number | null;
  humanized_score: number | null;
  document_type: string;
  created_at: string;
}

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const saveDocument = async (doc: {
    title?: string;
    original_text: string;
    humanized_text?: string;
    ai_score?: number;
    humanized_score?: number;
    document_type: 'detection' | 'humanization' | 'both' | 'paraphrase' | 'summary' | 'improvement';
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          ...doc,
        })
        .select()
        .single();

      if (error) throw error;
      
      setDocuments(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving document:', error);
      return null;
    }
  };

  const deleteDocument = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  };

  return { documents, loading, saveDocument, deleteDocument, refetch: fetchDocuments };
}
