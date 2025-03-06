'use client';

import React from 'react';
import StatusOption from '@/components/ui/StatusOption';

interface StatusOptionsGridProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export default function StatusOptionsGrid({ 
  selectedStatus, 
  onStatusChange 
}: StatusOptionsGridProps) {
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'reviewing', label: 'In Review', color: 'blue' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {statusOptions.map((option) => (
        <StatusOption 
          key={option.value}
          value={option.value} 
          label={option.label} 
          color={option.color}
          selected={selectedStatus === option.value} 
          onChange={() => onStatusChange(option.value)} 
        />
      ))}
    </div>
  );
}