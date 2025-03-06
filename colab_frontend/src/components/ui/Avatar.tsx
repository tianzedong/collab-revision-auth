'use client';

import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ 
  name, 
  size = 'md', 
  className = '' 
}: AvatarProps) {
  // Get the first letter of the name
  const initial = name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  
  // Size classes mapping
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };
  
  return (
    <div 
      className={`
        rounded-full bg-blue-100 flex items-center justify-center 
        text-blue-700 font-bold ${sizeClasses[size]} ${className}
      `}
      title={name}
    >
      {initial}
    </div>
  );
}