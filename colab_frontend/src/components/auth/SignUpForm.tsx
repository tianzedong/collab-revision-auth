// src/components/auth/SignUpForm.tsx
'use client';

import React from 'react';

interface SignUpFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  orgId: string;
  setOrgId: (orgId: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function SignUpForm({
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  orgId,
  setOrgId,
  loading,
  onSubmit
}: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit}>
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
          'Create Account'
        )}
      </button>
    </form>
  );
}