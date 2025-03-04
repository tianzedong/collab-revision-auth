// src/components/auth/Auth.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Add name state
  const [orgId, setOrgId] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Include name in user metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name // Store name in user metadata
          }
        }
      });
      
      if (error) {
        alert(error.message);
        return;
      }
      
      // If signup successful, add user to organization
      if (data.user) {
        const { error: orgError } = await supabase
          .from('user_organizations')
          .insert([{ user_id: data.user.id, org_id: orgId }]);
        
        if (orgError) {
          alert(`Signup successful but failed to set organization: ${orgError.message}`);
        } else {
          alert('Signup successful! Please check your email for verification.');
        }
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert('An error occurred during signup.');
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
      }
    } catch (error) {
      console.error('Error signing in:', error);
      alert('An error occurred during sign in.');
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
            {/* Add name field for signup */}
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