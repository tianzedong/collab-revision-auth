// src/hooks/useRevisionHistory.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Revision } from '@/types';

export function useRevisionHistory(documentId: string, session: any) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [newRevisionIds, setNewRevisionIds] = useState<Set<string>>(new Set());
  
  // Set up real-time subscription and fetch revisions
  useEffect(() => {
    if (!session?.user) return;
    
    fetchRevisions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`public:revisions:document_id=eq.${documentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'revisions',
        filter: `document_id=eq.${documentId}`
      }, (payload) => {
        console.log('Revision change detected:', payload);
        fetchRevisions();
      })
      .subscribe((status) => {
        console.log(`Revision subscription status: ${status}`);
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, session]);
  
  // Handle "new" revision animation with useEffect
  useEffect(() => {
    if (newRevisionIds.size > 0) {
      const timer = setTimeout(() => {
        setNewRevisionIds(new Set());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [newRevisionIds]);
  
  const fetchRevisions = async () => {
    setLoading(true);

    // Remember current revisions to compare later
    const currentRevisionIds = new Set(revisions.map(rev => rev.id));
    
    // Fetch revisions for this document
    const { data, error } = await supabase
      .from('revisions')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching revisions:', error);
      setLoading(false);
      return;
    }
    
    if (data) {
      // Identify new revisions
      const newIds = new Set<string>();
      data.forEach(revision => {
        if (!currentRevisionIds.has(revision.id)) {
          newIds.add(revision.id);
        }
      });
      
      setNewRevisionIds(newIds);
      setRevisions(data);
      
      // Fetch user names separately
      if (data.length > 0) {
        // Get unique reviewer IDs
        const reviewerIds = [...new Set(data.map(rev => rev.reviewer_id))];
        
        // Fetch profiles one by one
        const names: Record<string, string> = {};
        
        for (const reviewerId of reviewerIds) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', reviewerId)
            .single();
            
          if (!profileError && profileData) {
            names[reviewerId] = profileData.full_name;
          } else {
            // Fallback to showing user ID or email
            names[reviewerId] = reviewerId === session.user.id 
              ? (session.user.user_metadata?.full_name || session.user.email || 'You')
              : 'Unknown User';
          }
        }
        
        setUserNames(names);
      }
    }
    
    setLoading(false);
  };

  return {
    revisions,
    loading,
    userNames,
    newRevisionIds,
    fetchRevisions
  };
}