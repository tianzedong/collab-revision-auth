// src/components/revisions/RevisionStatusForm.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RevisionStatusFormProps {
  documentId: string;
  session: any;
  onRevisionAdded?: () => void;
}

export default function RevisionStatusForm({ documentId, session, onRevisionAdded }: RevisionStatusFormProps) {
  const [status, setStatus] = useState('pending');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      alert('You must be signed in to submit a revision');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Fetch user's organization from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        
        // Fallback to user metadata if profile not found
        const orgId = session.user.user_metadata?.org_id;
        if (!orgId) {
          alert('Could not determine your organization');
          setSubmitting(false);
          return;
        }
        
        // Create revision with org_id from metadata
        const { error } = await supabase
          .from('revisions')
          .insert([{
            document_id: documentId,
            org_id: orgId,
            status,
            reviewer_id: session.user.id,
            comments
          }]);
          
        if (error) {
          console.error('Error submitting revision:', error);
          alert('Failed to submit revision');
          setSubmitting(false);
          return;
        }
      } else {
        // Create revision with org_id from profile
        const { error } = await supabase
          .from('revisions')
          .insert([{
            document_id: documentId,
            org_id: profileData.org_id,
            status,
            reviewer_id: session.user.id,
            comments
          }]);
          
        if (error) {
          console.error('Error submitting revision:', error);
          alert('Failed to submit revision');
          setSubmitting(false);
          return;
        }
      }
      
      // Success case
      setComments('');
      setSuccessMessage('Revision submitted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Call callback function if provided
      if (onRevisionAdded) {
        onRevisionAdded();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Update Revision Status</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-800">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-800">Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Add your comments about this revision..."
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {submitting ? 'Submitting...' : 'Submit Revision'}
        </button>
      </form>
      
      {successMessage && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}
    </div>
  );
}