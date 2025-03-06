// src/components/revisions/RevisionStatusForm.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/ToastContext';
import { useRevisionSubmit } from '@/hooks/useRevisionSubmit';
import StatusOptionsGrid from './StatusOptionsGrid';

interface RevisionStatusFormProps {
  documentId: string;
  session: any;
  onRevisionAdded?: () => void;
}

export default function RevisionStatusForm({ documentId, session, onRevisionAdded }: RevisionStatusFormProps) {
  const {
    status,
    setStatus,
    comments,
    setComments,
    submitting,
    handleSubmit
  } = useRevisionSubmit({ documentId, session, onRevisionAdded });
  
  return (
    <div className="p-6 border rounded-lg mt-6 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-5 text-gray-900">Update Revision Status</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-medium mb-3 text-gray-800">Status</label>
          <StatusOptionsGrid 
            selectedStatus={status} 
            onStatusChange={setStatus} 
          />
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
    </div>
  );
}