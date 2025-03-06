// src/components/documents/DocumentReader.tsx
'use client';

import React from 'react';
import { Document } from '@/types';

interface DocumentReaderProps {
  document: Document;
  onEditClick: () => void;
}

export default function DocumentReader({ document, onEditClick }: DocumentReaderProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
        <button
          onClick={onEditClick}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit Document
        </button>
      </div>
      <div className="prose max-w-none text-gray-800 border p-4 rounded-md min-h-[200px] bg-gray-50">
        {document.content}
      </div>
    </div>
  );
}