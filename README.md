# Collaborative Revision Status App

A real-time collaborative application that allows users within the same organization to track and update document revisions. Built with Next.js and Supabase for authentication and real-time database functionality.

## Features

- **Secure Authentication**: Email/password authentication with Supabase
- **Organization-based Access Control**: Users can only see and modify content within their organization
- **Real-time Synchronization**: Changes made by users in the same organization are instantly visible to others
- **Responsive Design**: Works across desktop and mobile devices

## Prerequisites

- Node.js (v16 or higher)
- npm
- A Supabase account (free tier works fine for development)

## Environment Setup

### 1. Clone the repository

```bash
git clone (https://github.com/tianzedong/collab-revision-auth)
cd collab-revision-auth/colab_frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Supabase and required packages
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

### 4. Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)

2. Get your Supabase URL and anon key from Project Settings > API

3. Create a `.env.local` file in the project root(`colab_frontend`) with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Set up the database schema by running the following SQL queries in the Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  org_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revisions table
CREATE TABLE revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id),
  org_id VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles (allows all operations including select)
CREATE POLICY "Allow all operations for authenticated users"
ON profiles
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create policies for documents
CREATE POLICY "Users can view their organization's documents" 
ON documents FOR SELECT 
USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert documents for their organization" 
ON documents FOR INSERT 
WITH CHECK (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization's documents" 
ON documents FOR UPDATE
USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Create policies for revisions
CREATE POLICY "Users can view their organization's revisions" 
ON revisions FOR SELECT 
USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert revisions for their organization" 
ON revisions FOR INSERT 
WITH CHECK (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization's revisions" 
ON revisions FOR UPDATE
USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Set up realtime subscriptions
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE documents, revisions;
COMMIT;
```

5. Enable Email Auth in Supabase Auth settings:
   - Go to Authentication > Providers
   - Ensure Email provider is enabled
   - For development, you may want to disable email confirmations

6. Configure user metadata for signup:
   - When creating a user account, your application should collect:
     - full_name
     - org_id (case sensitive organization identifier)
   - Save these values in the user's profile table after they sign up

### 4. Start the development server

```bash
npm run dev
```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## Testing Multi-User Functionality

To test the organization-based functionality:

1. Open the app in a normal browser window and create an account with org_id "engineering"
2. Open the app in an incognito window and create another account with the same org_id "engineering"
3. Open the app in a different browser and create an account with org_id "finance"

Users in the "engineering" organization should see the same documents and revisions, while users in the "finance" organization should see a different set of documents and revisions.