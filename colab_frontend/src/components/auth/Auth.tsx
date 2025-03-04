// src/components/auth/Auth.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate orgId is not empty
    if (!orgId.trim()) {
      alert('Please enter an Organization ID');
      setLoading(false);
      return;
    }
    
    try {
      // Step 1: Create the user account with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            org_id: orgId.trim()
          }
        }
      });
      
      if (error) {
        console.error("Sign-up error:", error);
        alert(`Sign-up error: ${error.message}`);
        setLoading(false);
        return;
      }
      
      if (!data.user) {
        alert("Sign-up failed: No user was created");
        setLoading(false);
        return;
      }
      
      // Step 2: Immediately create profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          full_name: name,
          org_id: orgId.trim()
        }]);
        
      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Don't block signup success, but log the error
      }
      
      console.log("User created with profile:", {
        userId: data.user.id,
        orgId: orgId.trim(),
        name: name
      });
      
      alert('Sign-up successful! You can now sign in.');
      
      // Switch to sign-in mode
      setMode('signin');
    } catch (error: any) {
      console.error('Error during sign-up:', error);
      alert(`An error occurred during sign-up: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }
      
      // If sign-in successful, ensure user has a profile
      if (data.user) {
        console.log("User signed in:", data.user);
        
        // Get org_id from metadata
        const orgId = data.user.user_metadata?.org_id;
        const fullName = data.user.user_metadata?.full_name || '';
        
        if (orgId) {
          // Check if user already has a profile
          const { data: profileData, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileCheckError) {
            // User doesn't have a profile yet, create one
            console.log("Creating profile for user with org_id:", orgId);
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: data.user.id, 
                full_name: fullName,
                org_id: orgId
              }]);
              
            if (insertError) {
              console.error("Error creating profile on sign-in:", insertError);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      alert(`An error occurred during sign-in: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </h2>
      
      <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        {mode === 'signup' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., Alice, Bob, Diana"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="orgId">
                Organization ID
              </label>
              <input
                id="orgId"
                type="text"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., marketing, engineering"
                required
              />
            </div>
          </>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        {mode === 'signin' ? (
          <p>
            Don't have an account?{' '}
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}