'use client';

import React from 'react';

interface StatusOptionProps {
  value: string;
  label: string;
  color: string;
  selected: boolean;
  onChange: () => void;
}

export default function StatusOption({ value, label, color, selected, onChange }: StatusOptionProps) {
  // Map color names to their corresponding Tailwind classes
  const colorClasses = {
    yellow: {
      bg: selected ? 'bg-yellow-50' : '',
      border: selected ? 'border-yellow-500' : '',
      dot: 'bg-yellow-500'
    },
    blue: {
      bg: selected ? 'bg-blue-50' : '',
      border: selected ? 'border-blue-500' : '',
      dot: 'bg-blue-500'
    },
    green: {
      bg: selected ? 'bg-green-50' : '',
      border: selected ? 'border-green-500' : '',
      dot: 'bg-green-500'
    },
    red: {
      bg: selected ? 'bg-red-50' : '',
      border: selected ? 'border-red-500' : '',
      dot: 'bg-red-500'
    }
  };

  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <label 
      className={`
        relative flex items-center p-3 rounded-lg border cursor-pointer 
        transition-all duration-200 
        ${selected ? `${classes.bg} ${classes.border} shadow-sm` : 'bg-white border-gray-300 hover:bg-gray-50'}
      `}
    >
      <input
        type="radio"
        name="status"
        value={value}
        checked={selected}
        onChange={onChange}
        className="sr-only"
      />
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${classes.dot} mr-3`}></div>
        <span className="text-gray-900 font-medium">{label}</span>
      </div>
      {selected && (
        <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </label>
  );
}