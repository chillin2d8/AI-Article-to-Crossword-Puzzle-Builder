
import React from 'react';

interface ProgressTrackerProps {
    progress: { [key: string]: string };
}

const getStatusIcon = (message: string): React.ReactElement => {
    const lowerCaseMessage = message.toLowerCase();
    
    if (lowerCaseMessage.includes('success')) {
        return (
            <svg className="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        );
    }
    if (lowerCaseMessage.includes('fail') || lowerCaseMessage.includes('error') || lowerCaseMessage.includes('no image')) {
        return (
            <svg className="w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        );
    }
    
    // Default to a spinner for processing states
    return (
      <svg className="animate-spin w-4 h-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );
};


export const LoadingSpinner: React.FC<ProgressTrackerProps> = ({ progress }) => {
  const progressEntries = Object.entries(progress);

  return (
    <div className="mt-6 flex flex-col items-center justify-center space-y-2 p-4 text-left bg-slate-50 rounded-lg border border-slate-200 w-full">
        {progressEntries.length === 0 ? (
            <div className="flex items-center space-x-3">
                {getStatusIcon('loading')}
                <p className="text-slate-600 font-medium">Initializing...</p>
            </div>
        ) : (
            <ul className="space-y-1 w-full max-w-md animate-fade-in">
                {progressEntries.map(([stage, message]) => (
                    <li key={stage} className="flex items-center text-sm">
                        <span className="mr-3 w-4 inline-block text-center">{getStatusIcon(message)}</span>
                        <span className="font-semibold text-slate-700 w-36 truncate">{stage}:</span>
                        <span className="text-slate-600 ml-2">{message}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
  );
};
