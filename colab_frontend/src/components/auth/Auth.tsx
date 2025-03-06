// src/components/auth/Auth.tsx
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthHeader from './AuthHeader';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import AuthModeSwitcher from './AuthModeSwitcher';

export default function Auth() {
  const { mode, switchMode, signUpProps, signInProps } = useAuth();
  
  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <AuthHeader />
      
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
      </h2>
      
      {mode === 'signin' ? (
        <SignInForm 
          email={signInProps.email}
          setEmail={signInProps.setEmail}
          password={signInProps.password}
          setPassword={signInProps.setPassword}
          loading={signInProps.loading}
          onSubmit={signInProps.handleSignIn}
        />
      ) : (
        <SignUpForm 
          email={signUpProps.email}
          setEmail={signUpProps.setEmail}
          password={signUpProps.password}
          setPassword={signUpProps.setPassword}
          name={signUpProps.name}
          setName={signUpProps.setName}
          orgId={signUpProps.orgId}
          setOrgId={signUpProps.setOrgId}
          loading={signUpProps.loading}
          onSubmit={signUpProps.handleSignUp}
        />
      )}
      
      <AuthModeSwitcher 
        mode={mode} 
        onModeChange={switchMode} 
      />
    </div>
  );
}