'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Revision } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import Section from '@/components/ui/Section';
import Avatar from '@/components/ui/Avatar';

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

// Client-side only revision card
const RevisionCard = ({ revision, userName, isNew }: { revision: Revision, userName: string, isNew?: boolean }) => {
  const hasMounted = useHasMounted();
  
  // Return a skeleton during SSR to prevent hydration mismatch
  if (!hasMounted) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Client-side rendering with dynamic content
  return (
    <div className={`p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 ${isNew ? 'animate-slide-in' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
        <div className="mb-2 sm:mb-0">
          <StatusBadge status={revision.status} />
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {new Date(revision.created_at || '').toLocaleString()}
        </div>
      </div>
      
      <div className="flex items-center mb-3">
        <Avatar name={userName} size="sm" className="mr-2" />
        <div className="text-sm font-medium text-gray-800">
          {userName || 'Unknown User'}
        </div>
      </div>
      
      {revision.comments && (
        <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <p className="text-gray-800 whitespace-pre-line">{revision.comments}</p>
        </div>
      )}
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center h-48">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-700 font-medium">Loading revisions...</p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50 text-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className="text-gray-600">No revisions yet for this document.</p>
    <p className="text-gray-500 text-sm mt-1">Submit a revision to get started.</p>
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
    return <div className="mt-6"><EmptyState /></div>;
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
  );}