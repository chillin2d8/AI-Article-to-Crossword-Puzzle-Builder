import React, { useState } from 'react';
import { UserTier } from '../types';
import { USER_TIERS } from '../config';
import * as subscriptionService from '../services/subscriptionService';
import type { UserTierConfig } from '../types';
import type { User } from '@firebase/auth';

interface SubscriptionManagerProps {
    user: User;
    tier: UserTier;
    onClose: () => void;
}

const TierCard: React.FC<{ tierConfig: UserTierConfig, onSelect: (priceId: string) => void, isCurrent: boolean, isFeatured: boolean }> = React.memo(({ tierConfig, onSelect, isCurrent, isFeatured }) => {
    // We only want to render cards for paid tiers which have a priceId
    const paidTierConfig = tierConfig as typeof USER_TIERS['Monthly'] | typeof USER_TIERS['Yearly'];
    if (!paidTierConfig.priceId) return null;

    return (
        <div className={`p-6 rounded-lg border flex flex-col ${isFeatured ? 'bg-slate-800 text-white border-slate-700' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-lg font-bold">{tierConfig.name}</h3>
            <p className="mt-2 text-4xl font-bold">{tierConfig.price}<span className={`text-sm font-semibold ${isFeatured ? 'text-slate-400' : 'text-slate-500'}`}>{tierConfig.frequency}</span></p>
            <button
                onClick={() => onSelect(paidTierConfig.priceId)}
                disabled={isCurrent}
                className={`mt-6 w-full py-2 font-semibold rounded-md transition-colors ${isCurrent ? 'bg-slate-400 text-slate-800 cursor-not-allowed' : (isFeatured ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700')}`}
            >
                {isCurrent ? 'Current Plan' : 'Select Plan'}
            </button>
            <ul className={`mt-6 space-y-2 text-sm ${isFeatured ? 'text-slate-300' : 'text-slate-600'}`}>
                {tierConfig.features.map(feature => (
                    <li key={feature} className="flex items-start gap-x-2">
                        <svg className="h-5 w-4 flex-none text-indigo-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
});

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = React.memo(({ user, tier, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectPlan = async (priceId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await subscriptionService.createCheckoutSession(priceId, user);
            // The user will be redirected, so we don't need to setIsLoading(false) on success.
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setIsLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await subscriptionService.goToCustomerPortal(user);
            // The user will be redirected.
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setIsLoading(false);
        }
    };

    const isFreeTier = tier === 'Free';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-slate-100 rounded-xl shadow-2xl max-w-4xl w-full relative transform transition-all">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors z-10" aria-label="Close">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="p-8">
                    {isFreeTier ? (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 text-center">Upgrade Your Plan</h2>
                            <p className="text-slate-600 text-center mt-2">Choose a plan to unlock more features and support PLAY.</p>
                            <div className="grid md:grid-cols-2 gap-6 mt-8">
                                <TierCard 
                                    tierConfig={USER_TIERS.Monthly} 
                                    onSelect={handleSelectPlan}
                                    // FIX: When tier is 'Free', the current tier is not 'Monthly'. This resolves a TypeScript error.
                                    isCurrent={false}
                                    isFeatured={true}
                                />
                                <TierCard 
                                    tierConfig={USER_TIERS.Yearly}
                                    onSelect={handleSelectPlan}
                                    // FIX: When tier is 'Free', the current tier is not 'Yearly'. This resolves a TypeScript error.
                                    isCurrent={false}
                                    isFeatured={false}
                                />
                            </div>
                        </>
                    ) : (
                         <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900">Manage Your Subscription</h2>
                            <p className="text-slate-600 mt-2">You are currently on the <span className="font-semibold">{tier} Subscriber</span> plan.</p>
                            <div className="mt-8">
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={isLoading}
                                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 disabled:bg-slate-400"
                                >
                                    {isLoading ? 'Redirecting...' : 'Open Customer Portal'}
                                </button>
                                <p className="text-xs text-slate-500 mt-3">You will be redirected to Stripe to manage your billing.</p>
                            </div>
                        </div>
                    )}

                    {error && <p className="mt-4 text-center text-red-600">{error}</p>}
                </div>
            </div>
        </div>
    );
});