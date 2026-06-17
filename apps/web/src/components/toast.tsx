'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: '',
  type: 'info',
  visible: false,
  show: (message, type = 'info') => {
    set({ message, type, visible: true });
    setTimeout(() => set({ visible: false }), 3500);
  },
  hide: () => set({ visible: false }),
}));

export function Toast() {
  const { message, type, visible } = useToast();
  if (!visible) return null;

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={`fixed bottom-20 lg:bottom-6 right-4 z-50 max-w-sm px-4 py-3 rounded-lg border shadow-elevated text-sm font-medium ${styles[type]}`}
      role="status"
    >
      {message}
    </div>
  );
}
