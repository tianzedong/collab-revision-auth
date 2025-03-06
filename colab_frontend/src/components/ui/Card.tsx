'use client';

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
  isHoverable?: boolean;
  isNew?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  onClick, 
  isSelected = false,
  isHoverable = false,
  isNew = false
}: CardProps) {
  const baseClasses = 'p-4 border rounded-lg bg-white shadow-sm transition-all duration-300';
  
  const selectedClasses = isSelected 
    ? 'bg-blue-50 border-blue-500 shadow-sm animate-highlight' 
    : '';
  
  const hoverClasses = isHoverable && !isSelected
    ? 'hover:bg-gray-50 hover:shadow-sm cursor-pointer'
    : '';
    
  const newClasses = isNew
    ? 'animate-slide-in'
    : '';

  return (
    <div 
      className={`${baseClasses} ${selectedClasses} ${hoverClasses} ${newClasses} ${className}`} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}