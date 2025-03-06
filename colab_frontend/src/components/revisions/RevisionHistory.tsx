'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Revision } from '@/types';
import Section from '@/components/ui/Section';
import EmptyState from '@/components/ui/EmptyState';
import RevisionCard from '@/components/ui/RevisionCard';

// Custom hook to detect client-side rendering
function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

interface RevisionHistoryProps {
  documentId: string;
  session: any;
}

const EmptyRevisionState = () => (
  <EmptyState
    icon={
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    }
    message="No revisions yet for this document."
    title="Start the Review Process"
  />
);

const LoadingState = () => (
  <div className="flex items-center justify-center h-48">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-700 font-medium">Loading revisions...</p>
    </div>
  </div>
);

export default function RevisionHistory({ documentId, session }: RevisionHistoryProps) {
  const hasMounted = useHasMounted();
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [newRevisionIds, setNewRevisionIds] = useState<Set<string>>(new Set());
  
  // Only run after client-side hydration
  useEffect(() => {
    if (!session?.user || !hasMounted) return;
    
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
  }, [documentId, session, hasMounted]);
  
  // Handle "new" revision animation with useEffect
  useEffect(() => {
    if (newRevisionIds.size > 0 && hasMounted) {
      const timer = setTimeout(() => {
        setNewRevisionIds(new Set());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [newRevisionIds, hasMounted]);
  
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
  
  // Show skeleton loading state during SSR and initial loading
  if (!hasMounted) {
    return (
      <div className="p-6 border rounded-lg mt-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="p-4 border rounded-lg bg-white">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (revisions.length === 0) {
    return <div className="mt-6"><EmptyRevisionState /></div>;
  }
  
  return (
    <Section 
      title="Revision History"
      className="mt-6"
      actions={
        <span className="text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
          {revisions.length} {revisions.length === 1 ? 'revision' : 'revisions'}
        </span>
      }
      contentClassName="space-y-4"
    >
      {revisions.map((revision) => (
        <div key={revision.id}>
          <RevisionCard 
            revision={revision} 
            userName={userNames[revision.reviewer_id] || 'Unknown User'} 
            isNew={newRevisionIds.has(revision.id)}
          />
        </div>
      ))}
    </Section>
  );
}