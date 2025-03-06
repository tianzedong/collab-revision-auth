import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSignUpProps {
  onSuccess?: () => void;
}

export function useSignUp({ onSuccess }: UseSignUpProps = {}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgId, setOrgId] = useState('');

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
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error during sign-up:', error);
      alert(`An error occurred during sign-up: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    orgId,
    setOrgId,
    handleSignUp
  };
}