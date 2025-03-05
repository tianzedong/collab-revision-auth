// src/components/revisions/RevisionHistory.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Revision } from '@/types';

interface RevisionHistoryProps {
  documentId: string;
  session: any;
}

const StatusBadge = ({ status }: { status: string }) => {
  let bgColor, textColor, icon;
  
  switch (status) {
    case 'approved':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = (
        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = (
        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
      break;
    case 'reviewing':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = (
        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
      break;
    default:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = (
        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const RevisionCard = ({ revision, userName }: { revision: Revision, userName: string }) => (
  <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
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
      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-2">
        {userName && userName.charAt(0).toUpperCase()}
      </div>
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
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  
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
  
  const fetchRevisions = async () => {
    setLoading(true);
    
    // Fetch revisions for this document WITHOUT trying to join with profiles
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
    
    setRevisions(data || []);
    
    // Fetch user names separately
    if (data && data.length > 0) {
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
    
    setLoading(false);
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (revisions.length === 0) {
    return <div className="mt-6"><EmptyState /></div>;
  }
  
  return (
    <div className="p-6 border rounded-lg mt-6 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-gray-900">Revision History</h2>
        <span className="text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
          {revisions.length} {revisions.length === 1 ? 'revision' : 'revisions'}
        </span>
      </div>
      <div className="space-y-4">
        {revisions.map((revision) => (
          <RevisionCard 
            key={revision.id} 
            revision={revision} 
            userName={userNames[revision.reviewer_id] || 'Unknown User'} 
          />
        ))}
      </div>
    </div>
  );
}