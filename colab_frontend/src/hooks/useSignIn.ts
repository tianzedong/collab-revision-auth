// src/hooks/useSignIn.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useSignIn() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  return {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    handleSignIn
  };
}