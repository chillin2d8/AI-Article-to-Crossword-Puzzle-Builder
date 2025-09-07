import React, { useState, useRef, useEffect } from 'react';
import { UserTier } from '../types';
import type { User } from '@firebase/auth';

interface HeaderProps {
    user: User;
    tier: UserTier;
    onSignOut: () => void;
    onManageAccount: () => void;
    onGoToDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ user, tier, onSignOut, onManageAccount, onGoToDashboard }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const tierName = tier === 'Free' ? 'Free Plan' : `${tier} Subscriber`;
  const displayName = user.displayName || user.email?.split('@')[0];
  
  // Close menu if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <button onClick={onGoToDashboard}>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            PLAY ⚡
            </h1>
        </button>
        <div className="flex items-center gap-4 relative" ref={menuRef}>
            <div className="text-right">
                <button onClick={() => setIsMenuOpen(prev => !prev)} className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm font-semibold text-slate-700 hidden sm:inline">{displayName}</span>
                    <svg className={`w-4 h-4 text-slate-500 transition-transform ${isMenuOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                <p className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full inline-block mt-1">{tierName}</p>
            </div>
             {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-40 animate-fade-in-fast">
                    <button
                        onClick={() => { onGoToDashboard(); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => { onManageAccount(); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                        Manage Account
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                        onClick={() => { onSignOut(); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
});