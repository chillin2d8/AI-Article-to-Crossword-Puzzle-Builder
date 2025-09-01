import React, { useState } from 'react';
import { UserTier } from '../types';
import { USER_TIERS } from '../config';
import * as subscriptionService from '../services/subscriptionService';
import type { UserTierConfig } from '../types';

interface SubscriptionManagerProps {
    tier: UserTier;
    onClose: () => void;
}

const TierCard: React.FC<{ tierConfig: UserTierConfig, onSelect: (priceId: string) => void, isCurrent: boolean, isFeatured: boolean }> = ({ tierConfig, onSelect, isCurrent, isFeatured }) => {
    const paidTierConfig = tierConfig as typeof USER_TIERS['Monthly'] | typeof USER_TIERS['Yearly'];
    if (!paidTierConfig.priceId) return null;

    return (
        <div className={`p-6 rounded-lg border flex flex-col ${isFeatured ? 'bg-slate-800 text-white border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold">{tierConfig.name}</h3>
            <p className="mt-2 text-4xl font-bold">{tierConfig.price}<span className="text-sm font-semibold">{tierConfig.frequency}</span></p>
            <button
                onClick={() => onSelect(paidTierConfig.priceId)}
                disabled={isCurrent || !paidTierConfig.priceId}
                className={`mt-6 w-full py-2 font-semibold rounded-md transition-colors ${isCurrent ? 'bg-slate-400 text-slate-800 cursor-not-allowed' : (isFeatured ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700')}`}
            >
                {isCurrent ? 'Current Plan' : 'Select Plan'}
            </button>
            <ul className="mt-6 space-y-2 text-sm">
                {tierConfig.features.map(feature => (
                    <li key={feature} className="flex items-start gap-x-2">
                        <svg className="h-5 w-4 flex-none text-indigo-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ tier, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpgrade = async (priceId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await subscriptionService.createCheckoutSession(priceId);
            // The service handles redirection, so we just wait here. The loading state will persist until the page unloads.
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(message);
            setIsLoading(false);
        }
    };
    
    const handleManage = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await subscriptionService.goToCustomerPortal();
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(message);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-slate-100 rounded-xl shadow-2xl max-w-4xl w-full relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 p-2 leading-none text-2xl" aria-label="Close">&times;</button>
                <div className="p-6 md:p-8">
                    <h2 className="text-3xl font-bold text-slate-900 text-center">Manage Your Subscription</h2>
                    
                    {isLoading && <div className="text-center mt-6 text-slate-700">Redirecting to our secure payment portal...</div>}
                    {error && <div className="text-center text-red-600 bg-red-100 border border-red-200 p-3 rounded-md mt-6">{error}</div>}
                    
                    {!isLoading && !error && (
                        <>
                            <p className="mt-2 text-slate-600 text-center">Your current plan is: <span className="font-semibold text-indigo-600">{tier}</span></p>
                            
                            {tier === 'Free' && (
                                <>
                                    <p className="mt-4 text-slate-600 text-center">Ready for more? Upgrade your plan to unlock powerful new features.</p>
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* FIX: Corrected comparison that is always false within this block. If the current tier is 'Free', 'Monthly' cannot be the current tier. */}
                                        <TierCard tierConfig={USER_TIERS.Monthly} onSelect={handleUpgrade} isCurrent={false} isFeatured={true} />
                                        {/* FIX: Corrected comparison that is always false within this block. If the current tier is 'Free', 'Yearly' cannot be the current tier. */}
                                        <TierCard tierConfig={USER_TIERS.Yearly} onSelect={handleUpgrade} isCurrent={false} isFeatured={false} />
                                    </div>
                                </>
                            )}

                            {(tier === 'Monthly' || tier === 'Yearly') && (
                                <div className="mt-8 text-center bg-white p-6 rounded-lg border">
                                    <p className="text-slate-700">Manage your billing information, view invoices, or cancel your subscription through our secure payment partner, Stripe.</p>
                                    <button onClick={handleManage} className="mt-6 px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors">
                                        Go to Customer Portal
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
