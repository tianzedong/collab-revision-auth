// src/components/auth/AuthModeSwitcher.tsx
'use client';

import React from 'react';

interface AuthModeSwitcherProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export default function AuthModeSwitcher({ mode, onModeChange }: AuthModeSwitcherProps) {
  return (
    <div className="mt-6 text-center">
      {mode === 'signin' ? (
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
            onClick={() => onModeChange('signup')}
            type="button"
          >
            Sign Up
          </button>
        </p>
      ) : (
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
            onClick={() => onModeChange('signin')}
            type="button"
          >
            Sign In
          </button>
        </p>
      )}
    </div>
  );
}