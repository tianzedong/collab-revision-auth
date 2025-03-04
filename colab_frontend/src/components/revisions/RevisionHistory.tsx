// src/components/revisions/RevisionHistory.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Revision } from '@/types';

interface RevisionHistoryProps {
  documentId: string;
  session: any;
}

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
    return <div className="p-4">Loading revision history...</div>;
  }
  
  if (revisions.length === 0) {
    return <div className="p-4 border rounded-lg mt-4 text-gray-800">No revisions yet for this document.</div>;
  }
  
  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Revision History</h2>
      <div className="space-y-4">
        {revisions.map((revision) => (
          <div key={revision.id} className="p-3 border rounded bg-gray-50">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">
                Status: 
                <span className={`ml-2 px-2 py-0.5 rounded ${
                  revision.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  revision.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                  revision.status === 'reviewing' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {revision.status}
                </span>
              </span>
              <span className="text-sm text-gray-700">
                {new Date(revision.created_at || '').toLocaleString()}
              </span>
            </div>
            <div className="text-sm mt-1 text-gray-800">
              Reviewer: {userNames[revision.reviewer_id] || 'Unknown User'}
            </div>
            {revision.comments && (
              <div className="mt-2 text-gray-800 bg-white p-2 rounded border">
                {revision.comments}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}