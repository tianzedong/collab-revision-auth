// src/components/revisions/RevisionStatusForm.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RevisionStatusFormProps {
  documentId: string;
  session: any;
  onRevisionAdded?: () => void;
}

interface StatusOptionProps {
  value: string;
  label: string;
  color: string;
  selected: boolean;
  onChange: () => void;
}

const StatusOption = ({ value, label, color, selected, onChange }: StatusOptionProps) => {
    // Map color names to their corresponding Tailwind classes
    const colorClasses = {
      yellow: {
        bg: selected ? 'bg-yellow-50' : '',
        border: selected ? 'border-yellow-500' : '',
        dot: 'bg-yellow-500'
      },
      blue: {
        bg: selected ? 'bg-blue-50' : '',
        border: selected ? 'border-blue-500' : '',
        dot: 'bg-blue-500'
      },
      green: {
        bg: selected ? 'bg-green-50' : '',
        border: selected ? 'border-green-500' : '',
        dot: 'bg-green-500'
      },
      red: {
        bg: selected ? 'bg-red-50' : '',
        border: selected ? 'border-red-500' : '',
        dot: 'bg-red-500'
      }
    };
  
    const classes = colorClasses[color as keyof typeof colorClasses];
  
    return (
      <label 
        className={`
          relative flex items-center p-3 rounded-lg border cursor-pointer 
          transition-all duration-200 
          ${selected ? `${classes.bg} ${classes.border} shadow-sm` : 'bg-white border-gray-300 hover:bg-gray-50'}
        `}
      >
        <input
          type="radio"
          name="status"
          value={value}
          checked={selected}
          onChange={onChange}
          className="sr-only"
        />
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${classes.dot} mr-3`}></div>
          <span className="text-gray-900 font-medium">{label}</span>
        </div>
        {selected && (
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </label>
    );
  };

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
    <div className="p-6 border rounded-lg mt-6 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-5 text-gray-900">Update Revision Status</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-medium mb-3 text-gray-800">Status</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <StatusOption 
              value="pending" 
              label="Pending" 
              color="yellow"
              selected={status === 'pending'} 
              onChange={() => setStatus('pending')} 
            />
            <StatusOption 
              value="reviewing" 
              label="In Review" 
              color="blue"
              selected={status === 'reviewing'} 
              onChange={() => setStatus('reviewing')} 
            />
            <StatusOption 
              value="approved" 
              label="Approved" 
              color="green"
              selected={status === 'approved'} 
              onChange={() => setStatus('approved')} 
            />
            <StatusOption 
              value="rejected" 
              label="Rejected" 
              color="red"
              selected={status === 'rejected'} 
              onChange={() => setStatus('rejected')} 
            />
          </div>
        </div>
        
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-gray-800">Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            rows={5}
            placeholder="Add your comments about this revision..."
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
        >
          {submitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Submit Revision
            </>
          )}
        </button>
      </form>
      
      {successMessage && (
        <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-md animate-pulse">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}