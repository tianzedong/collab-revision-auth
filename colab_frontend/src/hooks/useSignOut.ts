// src/hooks/useSignOut.ts - Updated version
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useSignOut() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      // Check if there's a valid session first
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        console.log('No active session found, refreshing page...');
        window.location.href = '/';
        return true;
      }
      
      // Proceed with sign out if session exists
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        alert(`Error signing out: ${error.message}`);
        return false;
      }
      
      // Force page refresh to ensure clean state
      window.location.href = '/';
      
      return true;
    } catch (error: any) {
      console.error('Unexpected error during sign-out:', error);
      
      // Even if there's an error, try to force refresh
      window.location.href = '/';
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSignOut
  };
}