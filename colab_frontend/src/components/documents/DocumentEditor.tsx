'use client';

import React from 'react';
import { Document } from '@/types';

interface DocumentEditorProps {
  document: Document;
  editableTitle: string;
  editableContent: string;
  setEditableTitle: (title: string) => void;
  setEditableContent: (content: string) => void;
  updateDocument: () => Promise<void>;
  cancelEditing: () => void;
}

export default function DocumentEditor({
  document,
  editableTitle,
  editableContent,
  setEditableTitle,
  setEditableContent,
  updateDocument,
  cancelEditing
}: DocumentEditorProps) {
  return (
    <div>
      <input
        type="text"
        value={editableTitle}
        onChange={(e) => setEditableTitle(e.target.value)}
        className="w-full text-2xl font-bold mb-4 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />
      <textarea
        value={editableContent}
        onChange={(e) => setEditableContent(e.target.value)}
        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[200px]"
        rows={10}
      />
      <div className="mt-4 flex gap-2">
        <button
          onClick={updateDocument}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Save Changes
        </button>
        <button
          onClick={cancelEditing}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}