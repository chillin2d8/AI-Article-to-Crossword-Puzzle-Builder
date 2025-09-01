
import React from 'react';
import { UserTier } from '../types';

interface HeaderProps {
    tierName: string;
    onSignOut: () => void;
    onManageSubscription: () => void;
    tier: UserTier;
}

export const Header: React.FC<HeaderProps> = ({ tierName, onSignOut, onManageSubscription, tier }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            PLAY ⚡
            </h1>
            <p className="text-slate-500 mt-1">
            Puzzle Learning Aids for Youth
            </p>
        </div>
        <div className="text-right flex items-center">
             <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">{tierName}</span>
             <button onClick={onManageSubscription} className="ml-4 text-xs font-semibold text-slate-500 hover:text-indigo-600">
                {tier === 'Free' ? 'Upgrade' : 'Manage Subscription'}
             </button>
             <button onClick={onSignOut} className="ml-4 text-xs font-semibold text-slate-500 hover:text-indigo-600">
                Sign Out
             </button>
        </div>
      </div>
    </header>
  );
};