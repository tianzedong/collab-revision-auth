// src/types/index.ts
export interface Document {
    id: string;
    title: string;
    content: string;
    org_id: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Revision {
    id: string;
    document_id: string;
    org_id: string;
    status: string;
    reviewer_id: string;
    comments: string;
    created_at?: string;
  }
  
  export interface UserOrganization {
    user_id: string;
    org_id: string;
    created_at?: string;
  }