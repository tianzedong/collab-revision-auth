'use client';

import React, { ReactNode } from 'react';
import { ToastProvider } from './ToastContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}