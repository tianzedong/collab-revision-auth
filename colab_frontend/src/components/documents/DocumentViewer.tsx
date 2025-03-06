// src/components/documents/DocumentViewer.tsx
'use client';

import React, { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import DocumentItem from './DocumentItem';
import DocumentReader from './DocumentReader';
import DocumentEditor from './DocumentEditor';
import { useDocuments } from '@/hooks/useDocuments';

interface DocumentViewerProps {
  onDocumentSelect?: (documentId: string) => void;
  session: any;
}

const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" text="Loading documents..." />
  </div>
);

export default function DocumentViewer({ onDocumentSelect, session }: DocumentViewerProps) {
  const {
    documents,
    selectedDocument,
    loading,
    userOrg,
    isEditing,
    editableTitle,
    editableContent,
    setIsEditing,
    setEditableTitle,
    setEditableContent,
    handleDocumentSelect,
    createNewDocument,
    updateDocument
  } = useDocuments(session);

  // Pass the selected document ID to the parent component
  useEffect(() => {
    if (selectedDocument && onDocumentSelect) {
      onDocumentSelect(selectedDocument.id);
    }
  }, [selectedDocument, onDocumentSelect]);
  
  if (loading) {
    return <LoadingState />;
  }
  
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Document list sidebar */}
      <div className="w-full md:w-1/3 p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Documents</h2>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            <span className="font-medium">{userOrg}</span>
          </span>
        </div>
        
        {documents.length === 0 ? (
          <EmptyState
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            message="No documents found for your organization."
            actionLabel="Create Your First Document"
            onAction={createNewDocument}
          />
        ) : (
          <div className="space-y-3 mb-4">
            {documents.map(doc => (
              <DocumentItem 
                key={doc.id}
                doc={doc}
                isSelected={selectedDocument?.id === doc.id}
                onClick={() => handleDocumentSelect(doc)}
              />
            ))}
          </div>
        )}

        {documents.length > 0 && (
        <Button 
            variant="success"
            fullWidth
            onClick={createNewDocument}
            startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
            }
        >
            Create New Document
        </Button>
        )}
      </div>
      
      {/* Selected document view */}
      {selectedDocument ? (
        <div className="w-full md:w-2/3 p-4 border rounded-lg bg-white shadow-sm">
          {isEditing ? (
            // Use the DocumentEditor component for editing mode
            <DocumentEditor
              document={selectedDocument}
              editableTitle={editableTitle}
              editableContent={editableContent}
              setEditableTitle={setEditableTitle}
              setEditableContent={setEditableContent}
              updateDocument={updateDocument}
              cancelEditing={() => setIsEditing(false)}
            />
          ) : (
            // View mode with DocumentReader component
            <DocumentReader 
              document={selectedDocument} 
              onEditClick={() => {
                setEditableTitle(selectedDocument.title);
                setEditableContent(selectedDocument.content);
                setIsEditing(true);
              }} 
            />
          )}
        </div>
      ) : (
        <div className="w-full md:w-2/3 p-8 border rounded-lg bg-white shadow-sm flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-gray-600">Select a document or create a new one to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
}