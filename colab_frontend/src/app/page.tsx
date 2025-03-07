// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/auth/Auth';
import DocumentViewer from '@/components/documents/DocumentViewer';
import RevisionStatusForm from '@/components/revisions/RevisionStatusForm';
import RevisionHistory from '@/components/revisions/RevisionHistory';
import Avatar from '@/components/ui/Avatar';
import SignOutButton from '@/components/auth/SignOutButton';

// Updated UserSessionBar component for page.tsx
const UserSessionBar = ({ session }: { session: any }) => {
  const [orgId, setOrgId] = useState<string>('Unknown Org');
  
  useEffect(() => {
    // Get organization from profiles table (primary source)
    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', session.user.id)
        .single();
        
      if (!error && data) {
        setOrgId(data.org_id);
        return;
      }
      
      // Fall back to metadata if profile not found
      const metadataOrgId = session.user.user_metadata?.org_id;
      if (metadataOrgId) {
        setOrgId(metadataOrgId);
      }
    };
    
    fetchUserProfile();
  }, [session]);

  return (
    <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <Avatar 
            name={session.user.user_metadata?.full_name || session.user.email || 'User'} 
            className="mr-3"
          />
          <div>
            <p className="font-medium text-gray-900">
              {session.user.user_metadata?.full_name || session.user.email}
            </p>
            <p className="text-sm text-gray-600">
              Organization: <span className="font-medium">{orgId}</span>
            </p>
          </div>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
};

const PageHeader = () => (
  <div className="mb-8 text-center">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaborative Revision Status</h1>
    <p className="text-gray-600">Work together on documents and track revision status in real-time</p>
  </div>
);

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [revisionKey, setRevisionKey] = useState(0);

  useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleRevisionAdded = () => {
    // Increment the key to force RevisionHistory to re-fetch data
    setRevisionKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-700 font-medium">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader />
        
        {!session ? (
          <Auth />
        ) : (
          <div>
            <UserSessionBar session={session} />
            
            <DocumentViewer 
              session={session} 
              onDocumentSelect={setSelectedDocumentId} 
            />
            
            {selectedDocumentId && (
              <div>
                <RevisionStatusForm 
                  documentId={selectedDocumentId} 
                  session={session}
                  onRevisionAdded={handleRevisionAdded} 
                />
                <RevisionHistory 
                  key={revisionKey} 
                  documentId={selectedDocumentId} 
                  session={session} 
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-200">
        <p className="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Collaborative Revision App. All rights reserved.
        </p>
      </footer>
    </main>
  );
}