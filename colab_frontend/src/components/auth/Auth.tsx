// src/components/auth/Auth.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import AuthHeader from './AuthHeader';

export default function Auth() {
  const { mode, switchMode, signUpProps, signInProps } = useAuth();
  
  const {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    handleSignIn
  } = signInProps;
  
  const {
    name,
    setName,
    orgId,
    setOrgId,
    handleSignUp
  } = signUpProps;
  
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
              onClick={() => switchMode('signup')}
            >
              Sign Up
            </button>
          </p>
        ) : (
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              onClick={() => switchMode('signin')}
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}