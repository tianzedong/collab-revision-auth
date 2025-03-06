'use client';

import React, { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function Section({ 
  children, 
  title, 
  description,
  actions,
  className = '',
  contentClassName = ''
}: SectionProps) {
  const hasHeader = title || description || actions;
  
  return (
    <div className={`p-6 border rounded-lg bg-white shadow-sm ${className}`}>
      {hasHeader && (
        <div className="flex justify-between items-center mb-5">
          <div>
            {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  );
}