// src/hooks/useDocuments.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Document } from '@/types';

export function useDocuments(session: any) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [userOrg, setUserOrg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableContent, setEditableContent] = useState('');

  // Fetch user organization
  useEffect(() => {
    if (!session?.user) return;
    
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

  // Set up real-time subscription and fetch documents
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

  return {
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
  };
}