// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/auth/Auth';
import DocumentViewer from '@/components/documents/DocumentViewer';
import RevisionStatusForm from '@/components/revisions/RevisionStatusForm';
import RevisionHistory from '@/components/revisions/RevisionHistory';

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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Collaborative Revision Status
        </h1>
        
        {!session ? (
          <Auth />
        ) : (
          <div>
            <div className="mb-8 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700">
                    Signed in as: <span className="font-medium">{session.user.user_metadata?.full_name || session.user.email}</span>
                  </p>
                </div>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => supabase.auth.signOut()}
                >
                  Sign Out
                </button>
              </div>
            </div>
            
            <DocumentViewer 
              session={session} 
              onDocumentSelect={setSelectedDocumentId} 
            />
            
            {selectedDocumentId && (
              <div className="mt-8">
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
    </main>
  );
}