
import React from 'react';

interface LoadingSpinnerProps {
    message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="mt-6 flex flex-col items-center justify-center space-y-4 p-4 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium">{message}</p>
    </div>
  );
};
