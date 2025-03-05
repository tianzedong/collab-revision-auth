'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types';

interface DocumentViewerProps {
  onDocumentSelect?: (documentId: string) => void;
  session: any;
}

interface DocumentItemProps {
  doc: Document;
  isSelected: boolean;
  onClick: () => void;
}

const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-700 font-medium">Loading documents...</p>
    </div>
  </div>
);

const DocumentItem = ({ doc, isSelected, onClick }: DocumentItemProps) => (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-blue-50 border-blue-500 shadow-sm animate-highlight' 
          : 'hover:bg-gray-50 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.title}</h3>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          {new Date(doc.created_at || '').toLocaleDateString()}
        </span>
        <span className="px-2 py-1 bg-gray-100 rounded-full">
          {doc.content.length < 100 ? 'Short' : doc.content.length < 500 ? 'Medium' : 'Long'}
        </span>
      </div>
    </div>
  );

const EmptyState = ({ onCreateNew }: { onCreateNew: () => void }) => (
  <div className="flex flex-col items-center justify-center h-64 p-8 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className="text-gray-600 mb-4 text-center">No documents found for your organization.</p>
    <button 
      onClick={onCreateNew}
      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      Create Your First Document
    </button>
  </div>
);

export default function DocumentViewer({ onDocumentSelect, session }: DocumentViewerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [userOrg, setUserOrg] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
  
    // Log the entire user object to see what's available
    console.log("Current user:", session.user);
    console.log("User metadata:", session.user.user_metadata);
    
    // Get organization from profiles table (primary source)
    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', session.user.id)
        .single();
        
      if (!error && data) {
        console.log("Using organization from profiles table:", data.org_id);
        setUserOrg(data.org_id);
        return;
      }
      
      console.log("Profile not found, checking metadata...");
      
      // Fall back to metadata if profile not found
      const metadataOrgId = session.user.user_metadata?.org_id;
      
      if (metadataOrgId) {
        console.log("Using organization from metadata:", metadataOrgId);
        
        // Create profile entry for future use
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || '',
            org_id: metadataOrgId
          }]);
          
        if (insertError) {
          console.error("Error creating profile from metadata:", insertError);
        }
        
        setUserOrg(metadataOrgId);
        return;
      }
      
      // Last resort fallback
      const emailPrefix = session.user.email.split('@')[0];
      console.log("Falling back to email prefix as org:", emailPrefix);
      
      // Create profile with email-based org
      const { error: fallbackError } = await supabase
        .from('profiles')
        .insert([{
          id: session.user.id,
          full_name: session.user.email,
          org_id: emailPrefix
        }]);
        
      if (fallbackError) {
        console.error("Error creating fallback profile:", fallbackError);
      }
      
      setUserOrg(emailPrefix);
    };
    
    fetchUserProfile();
  }, [session]);

  useEffect(() => {
    if (!userOrg) return;
    
    fetchDocuments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:documents')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `org_id=eq.${userOrg}`
      }, (payload) => {
        console.log('Document change detected:', payload);
        fetchDocuments();
      })
      .subscribe((status) => {
        console.log(`Document subscription status: ${status}`);
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userOrg]);

  const fetchDocuments = async () => {
    if (!userOrg) return;
    
    setLoading(true);
    
    // Fetch all documents for user's organization
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('org_id', userOrg)
      .order('created_at', { ascending: false });
      
    console.log("Fetch documents response:", { data, error });
      
    if (error) {
      console.error('Error fetching documents:', error);
      setLoading(false);
      return;
    }
    
    setDocuments(data || []);
    
    // Select the first document by default if available
    if (data && data.length > 0 && !selectedDocument) {
      setSelectedDocument(data[0]);
      setEditableTitle(data[0].title);
      setEditableContent(data[0].content);
      if (onDocumentSelect) {
        onDocumentSelect(data[0].id);
      }
    } else if (selectedDocument) {
      // Find and update the selected document if it exists
      const currentDoc = data?.find(doc => doc.id === selectedDocument.id);
      if (currentDoc) {
        setSelectedDocument(currentDoc);
        if (!isEditing) {
          setEditableTitle(currentDoc.title);
          setEditableContent(currentDoc.content);
        }
      }
    }
    
    setLoading(false);
  };
  
  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setEditableTitle(document.title);
    setEditableContent(document.content);
    setIsEditing(false);
    if (onDocumentSelect) {
      onDocumentSelect(document.id);
    }
  };
  
  const createNewDocument = async () => {
    if (!userOrg || !session?.user) return;
    
    const { data, error } = await supabase
      .from('documents')
      .insert([{ 
        title: `New Document ${documents.length + 1}`, 
        content: 'Document content goes here...', 
        org_id: userOrg 
      }])
      .select();
      
    if (error) {
      console.error('Error creating document:', error);
    } else if (data) {
      await fetchDocuments();
    }
  };
  
  const updateDocument = async () => {
    if (!selectedDocument || !userOrg) return;
    
    const { error } = await supabase
      .from('documents')
      .update({
        title: editableTitle,
        content: editableContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedDocument.id);
      
    if (error) {
      console.error('Error updating document:', error);
      alert('Failed to update document');
    } else {
      setIsEditing(false);
      await fetchDocuments();
    }
  };
  
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
        <EmptyState onCreateNew={createNewDocument} />
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
        <button 
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
            onClick={createNewDocument}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Document
        </button>
        )}
      </div>
      
      {/* Selected document view */}
      {selectedDocument ? (
        <div className="w-full md:w-2/3 p-4 border rounded-lg bg-white shadow-sm">
          {isEditing ? (
            // Editing mode
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
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <div>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{selectedDocument.title}</h1>
                <button
                  onClick={() => {
                    setEditableTitle(selectedDocument.title);
                    setEditableContent(selectedDocument.content);
                    setIsEditing(true);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Document
                </button>
              </div>
              <div className="prose max-w-none text-gray-800 border p-4 rounded-md min-h-[200px] bg-gray-50">
                {selectedDocument.content}
              </div>
            </div>
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