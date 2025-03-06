import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/ToastContext';

interface UseRevisionSubmitParams {
  documentId: string;
  session: any;
  onRevisionAdded?: () => void;
}

export function useRevisionSubmit({ documentId, session, onRevisionAdded }: UseRevisionSubmitParams) {
  const [status, setStatus] = useState('pending');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      showToast('You must be signed in to submit a revision', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Fetch user's organization from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        
        // Fallback to user metadata if profile not found
        const orgId = session.user.user_metadata?.org_id;
        if (!orgId) {
          showToast('Could not determine your organization', 'error');
          setSubmitting(false);
          return;
        }
        
        // Create revision with org_id from metadata
        const { error } = await supabase
          .from('revisions')
          .insert([{
            document_id: documentId,
            org_id: orgId,
            status,
            reviewer_id: session.user.id,
            comments
          }]);
          
        if (error) {
          console.error('Error submitting revision:', error);
          showToast('Failed to submit revision', 'error');
          setSubmitting(false);
          return;
        }
      } else {
        // Create revision with org_id from profile
        const { error } = await supabase
          .from('revisions')
          .insert([{
            document_id: documentId,
            org_id: profileData.org_id,
            status,
            reviewer_id: session.user.id,
            comments
          }]);
          
        if (error) {
          console.error('Error submitting revision:', error);
          showToast('Failed to submit revision', 'error');
          setSubmitting(false);
          return;
        }
      }
      
      // Success case
      setComments('');
      showToast('Revision submitted successfully!', 'success');
      
      // Call callback function if provided
      if (onRevisionAdded) {
        onRevisionAdded();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  return {
    status,
    setStatus,
    comments,
    setComments,
    submitting,
    handleSubmit
  };
}