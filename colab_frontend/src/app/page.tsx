'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/auth/Auth';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          <div className="text-center">
            <p className="mb-4">Signed in as: {session.user.email}</p>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </main>
  );
}