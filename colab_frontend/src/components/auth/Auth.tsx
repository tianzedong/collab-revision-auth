// src/components/auth/Auth.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import AuthHeader from './AuthHeader';


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

  const AuthHeader = () => (
    <div className="text-center mb-8">
      <div className="inline-block p-4 rounded-full bg-blue-100 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Collaborative Revision</h1>
      <p className="text-gray-600 mt-2">Work together on documents in real-time</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <AuthHeader />
      
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
      </h2>
      
      <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
        <div className="mb-5">
          <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
        
        <div className="mb-5">
          <label className="block text-gray-700 mb-2 font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
        
        {mode === 'signup' && (
          <>
            <div className="mb-5">
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="name">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g., Alice, Bob, Diana"
                required
              />
            </div>
            <div className="mb-5">
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="orgId">
                Organization ID
              </label>
              <input
                id="orgId"
                type="text"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g., marketing, engineering"
                required
              />
            </div>
          </>
        )}
        
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            mode === 'signin' ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        {mode === 'signin' ? (
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </p>
        ) : (
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );}