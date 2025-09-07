import React, { useState, useEffect } from 'react';
import type { User } from '@firebase/auth';
import type { UserTier, SubscriptionInfo } from '../types';
import * as authService from '../services/authService';
import * as firestoreService from '../services/firestoreService';

interface AccountManagerProps {
    user: User;
    tier: UserTier;
    onClose: () => void;
    onManageSubscription: () => void;
}

type View = 'main' | 'updateEmail' | 'deleteAccount';

export const AccountManager: React.FC<AccountManagerProps> = React.memo(({ user, tier, onClose, onManageSubscription }) => {
    const [view, setView] = useState<View>('main');
    const [password, setPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);

    useEffect(() => {
        const fetchSubInfo = async () => {
            if (tier !== 'Free') {
                const info = await firestoreService.getSubscriptionInfo(user.uid);
                setSubscriptionInfo(info);
            }
        };
        fetchSubInfo();
    }, [user.uid, tier]);

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await authService.reauthenticateUser(password);
            await authService.updateUserEmail(newEmail);
            setSuccess("Email updated successfully! Please log in again with your new email.");
            // Optionally, sign the user out after email change
            setTimeout(() => {
                authService.logOut();
                onClose();
            }, 3000);
        } catch (err) {
            let message = "An error occurred.";
            if (err instanceof Error) {
                if (err.message.includes('wrong-password') || err.message.includes('Incorrect password')) {
                    message = "The password you entered is incorrect.";
                } else if (err.message.includes('email-already-in-use')) {
                    message = "This email address is already in use by another account.";
                } else {
                    message = err.message;
                }
            }
            setError(message);
        } finally {
            setIsLoading(false);
            setPassword('');
        }
    };

    const renderMainView = () => (
        <>
            <h2 className="text-2xl font-bold text-slate-900 text-center">Manage Account</h2>
            
            <div className="mt-6 space-y-4">
                <div>
                    <h3 className="font-semibold text-slate-800">Profile</h3>
                    <div className="mt-2 bg-white p-4 rounded-lg border">
                        <p><span className="font-medium text-slate-600">Name:</span> {user.displayName}</p>
                        <p><span className="font-medium text-slate-600">Email:</span> {user.email}</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-slate-800">Subscription</h3>
                    <div className="mt-2 bg-white p-4 rounded-lg border">
                        <p><span className="font-medium text-slate-600">Current Plan:</span> {tier}</p>
                        {subscriptionInfo && (
                            <div className="text-sm mt-2 space-y-1">
                                <p><span className="font-medium text-slate-600">Status:</span> <span className="capitalize">{subscriptionInfo.status}</span></p>
                                <p><span className="font-medium text-slate-600">Renews on:</span> {subscriptionInfo.current_period_end.toLocaleDateString()}</p>
                            </div>
                        )}
                        <button onClick={onManageSubscription} className="mt-3 text-sm font-semibold text-indigo-600 hover:underline">
                            {tier === 'Free' ? 'Upgrade Plan' : 'Manage Billing'}
                        </button>
                        {tier === 'Yearly' && (
                             <p className="text-xs text-slate-500 mt-2">
                                Note: Downgrading your plan will limit your visible activity history.
                            </p>
                        )}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-slate-800">Security</h3>
                    <div className="mt-2 bg-white p-4 rounded-lg border space-y-2">
                       <button onClick={() => setView('updateEmail')} className="text-sm font-semibold text-indigo-600 hover:underline">
                            Change Email Address
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
    
    const renderUpdateEmailView = () => (
         <>
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => { setView('main'); setError(null); }} className="text-slate-500 hover:text-slate-800">&larr;</button>
                <h2 className="text-xl font-bold text-slate-900">Update Email Address</h2>
            </div>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
                 <p className="text-sm text-slate-600">For your security, please enter your current password to make this change.</p>
                 <div>
                    <label className="text-sm font-medium" htmlFor="new-email">New Email</label>
                    <input id="new-email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" />
                 </div>
                 <div>
                    <label className="text-sm font-medium" htmlFor="current-password">Current Password</label>
                    <input id="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" />
                 </div>
                 {error && <p className="text-sm text-red-600">{error}</p>}
                 {success && <p className="text-sm text-green-600">{success}</p>}
                 <button type="submit" disabled={isLoading} className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-400">
                     {isLoading ? 'Updating...' : 'Update Email'}
                 </button>
            </form>
         </>
    );

    const renderView = () => {
        switch(view) {
            case 'updateEmail': return renderUpdateEmailView();
            case 'main':
            default:
                return renderMainView();
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-slate-100 rounded-xl shadow-2xl max-w-md w-full relative transform transition-all">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors z-10" aria-label="Close">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="p-8">
                    {renderView()}
                </div>
            </div>
        </div>
    );
});