import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useStore();

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold border ${
        isError
          ? 'bg-red-950/90 text-red-200 border-red-800'
          : isInfo
          ? 'bg-blue-950/90 text-blue-200 border-blue-800'
          : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
      }`}>
        {isError ? (
          <AlertCircle className="w-4 h-4 text-red-400" />
        ) : isInfo ? (
          <Info className="w-4 h-4 text-blue-400" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
