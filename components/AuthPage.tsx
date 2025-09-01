
import React, { useState } from 'react';
import * as authService from '../services/authService';
import { isFirebaseConfigured } from '../firebaseConfig';
import { LegalModal } from './LegalModal';

interface AuthPageProps {
    onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
    const [email, setEmail] = useState('free@test.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            setError("You must agree to the terms of service to continue.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await authService.signIn({ email, password });
            // The onAuthStateChanged listener in App.tsx will handle the redirect.
        } catch (err) {
            let message = "Failed to sign in. Please check your email and password.";
            if (err instanceof Error) {
                if (err.message.includes("Simulated Auth")) {
                    message = "Invalid credentials for simulated admin.";
                } else if (!isFirebaseConfigured) {
                    message = "Login is in simulated mode. Please check credentials or configure Firebase.";
                }
            }
            setError(message);
            setIsLoading(false);
            console.error(err);
        }
    };

    return (
        <>
        {isLegalModalOpen && <LegalModal onClose={() => setIsLegalModalOpen(false)} />}
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-slate-200 relative">
                <button onClick={onBack} className="absolute top-4 left-4 text-slate-500 hover:text-slate-800">
                    &larr; Back
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
                    <p className="mt-2 text-slate-600">Enter your credentials to access your account.</p>
                </div>
                <form onSubmit={handleSignIn} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                            I have read and agree to the{' '}
                            <button type="button" onClick={() => setIsLegalModalOpen(true)} className="font-medium text-indigo-600 hover:text-indigo-500 underline">
                                Terms of Service
                            </button>
                            .
                        </label>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !agreedToTerms}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};
