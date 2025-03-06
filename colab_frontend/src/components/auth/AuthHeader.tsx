'use client';

import React from 'react';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AuthHeader({ 
  title = "Collaborative Revision",
  subtitle = "Work together on documents in real-time" 
}: AuthHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="inline-block p-4 rounded-full bg-blue-100 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-2">{subtitle}</p>
    </div>
  );
}