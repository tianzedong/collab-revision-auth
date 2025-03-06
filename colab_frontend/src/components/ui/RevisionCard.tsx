'use client';

import React from 'react';
import { Revision } from '@/types';
import StatusBadge from './StatusBadge';
import Avatar from './Avatar';

// Custom hook to detect client-side rendering
function useHasMounted() {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

interface RevisionCardProps {
  revision: Revision;
  userName: string;
  isNew?: boolean;
}

export default function RevisionCard({ revision, userName, isNew }: RevisionCardProps) {
  const hasMounted = useHasMounted();
  
  // Return a skeleton during SSR to prevent hydration mismatch
  if (!hasMounted) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Client-side rendering with dynamic content
  return (
    <div className={`p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 ${isNew ? 'animate-slide-in' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
        <div className="mb-2 sm:mb-0">
          <StatusBadge status={revision.status} />
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {new Date(revision.created_at || '').toLocaleString()}
        </div>
      </div>
      
      <div className="flex items-center mb-3">
        <Avatar name={userName} size="sm" className="mr-2" />
        <div className="text-sm font-medium text-gray-800">
          {userName || 'Unknown User'}
        </div>
      </div>
      
      {revision.comments && (
        <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <p className="text-gray-800 whitespace-pre-line">{revision.comments}</p>
        </div>
      )}
    </div>
  );
}