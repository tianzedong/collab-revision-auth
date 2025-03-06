// src/components/documents/DocumentItem.tsx
'use client';

import React from 'react';
import { Document } from '@/types';
import Card from '@/components/ui/Card';

interface DocumentItemProps {
  doc: Document;
  isSelected: boolean;
  onClick: () => void;
}

export default function DocumentItem({ doc, isSelected, onClick }: DocumentItemProps) {
  return (
    <Card 
      isSelected={isSelected}
      isHoverable
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
    </Card>
  );
}