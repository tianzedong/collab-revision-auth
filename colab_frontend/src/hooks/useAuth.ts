import { useState } from 'react';
import { useSignUp } from './useSignUp';
import { useSignIn } from './useSignIn';

export function useAuth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  const signUpProps = useSignUp({
    onSuccess: () => setMode('signin')
  });

  const signInProps = useSignIn();
  
  const handleSwitchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
  };

  return {
    mode,
    switchMode: handleSwitchMode,
    signUpProps,
    signInProps
  };
}