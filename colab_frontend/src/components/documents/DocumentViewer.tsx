'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types';

interface DocumentViewerProps {
  onDocumentSelect?: (documentId: string) => void;
  session: any;
}

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
    return <div className="p-4">Loading documents...</div>;
  }
  
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Document list sidebar */}
      <div className="w-full md:w-1/3 p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Documents</h2>
          <span className="text-sm text-gray-600">
            Organization: <span className="font-medium">{userOrg}</span>
          </span>
        </div>
        
        {documents.length === 0 ? (
          <p className="text-gray-800 mb-4">No documents found for your organization.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {documents.map(doc => (
              <div 
                key={doc.id}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-100 ${
                  selectedDocument?.id === doc.id ? 'bg-blue-100 border-blue-500' : ''
                }`}
                onClick={() => handleDocumentSelect(doc)}
              >
                <h3 className="font-medium text-gray-900">{doc.title}</h3>
              </div>
            ))}
          </div>
        )}
        
        <button 
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={createNewDocument}
        >
          Create New Document
        </button>
      </div>
      
      {/* Selected document view */}
      {selectedDocument ? (
        <div className="w-full md:w-2/3 p-4 border rounded-lg">
          {isEditing ? (
            // Editing mode
            <div>
              <input
                type="text"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                className="w-full text-2xl font-bold mb-4 p-2 border rounded"
              />
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                className="w-full p-2 border rounded min-h-[200px]"
                rows={10}
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={updateDocument}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Edit Document
                </button>
              </div>
              <div className="prose max-w-none text-gray-800 border p-4 rounded min-h-[200px]">
                {selectedDocument.content}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full md:w-2/3 p-4 border rounded-lg bg-gray-50">
          <p className="text-gray-800">Select a document or create a new one to get started.</p>
        </div>
      )}
    </div>
  );
}