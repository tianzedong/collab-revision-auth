// src/components/auth/SignOutButton.tsx
'use client';

import React from 'react';
import { supabase } from '@/lib/supabase';

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any local storage
      localStorage.clear();
      
      // Hard redirect to refresh the page completely
      window.location.href = '/';
    } catch (error) {
      console.error('Error during sign out:', error);
      alert('Failed to sign out. Please try again or refresh the page.');
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
    >
      <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Sign Out
    </button>
  );
}