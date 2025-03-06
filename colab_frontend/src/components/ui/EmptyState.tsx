'use client';

import React, { ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title,
  message,
  icon,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  // Default icon if none provided
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50 ${className}`}>
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      )}
      
      <p className="text-gray-600 mb-4 text-center">{message}</p>
      
      {actionLabel && onAction && (
        <Button 
          variant="success" 
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}