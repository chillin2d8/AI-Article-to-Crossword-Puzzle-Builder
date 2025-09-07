


import React, { useState } from 'react';
import * as authService from '../services/authService';
import { isFirebaseConfigured } from '../firebaseConfig';
import { LegalModal } from './LegalModal';

interface AuthPageProps {
    onBack: () => void;
}

type AuthMode = 'signin' | 'signup';

export const AuthPage: React.FC<AuthPageProps> = React.memo(({ onBack }) => {
    const [authMode, setAuthMode] = useState<AuthMode>('signin');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

    const isSignUp = authMode === 'signup';

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            setError("You must agree to the terms of service to continue.");
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                await authService.signUp({ email, password, fullName });
            } else {
                await authService.signIn({ email, password });
            }
            // The onAuthStateChanged listener in App.tsx will handle the redirect.
        } catch (err) {
            let message = "An unexpected error occurred. Please try again.";
            if (err instanceof Error) {
                 if (!isFirebaseConfigured) {
                    // Handle simulated mode errors first
                    if (err.message.includes("Invalid credentials")) {
                        message = "Invalid email or password. Please try again.";
                    } else if (err.message.includes("Email already in use")) {
                        message = "An account with this email already exists. Please sign in.";
                    } else {
                        message = "An unexpected error occurred during simulated login.";
                    }
                } else {
                    // Handle live Firebase errors
                    if (err.message.includes('auth/user-disabled')) {
                        message = "Your account has been suspended due to violations of our community guidelines.";
                    } else if (err.message.includes('auth/email-already-in-use')) {
                        message = "An account with this email already exists. Please sign in.";
                    } else if (err.message.includes('auth/weak-password')) {
                        message = "Password should be at least 6 characters.";
                    } else if (err.message.includes('auth/invalid-credential')) {
                        message = "Invalid email or password. Please try again.";
                    }
                }
            }
            setError(message);
            setIsLoading(false);
            console.error(err);
        }
    };

    const toggleMode = () => {
        setAuthMode(isSignUp ? 'signin' : 'signup');
        setError(null);
        setPassword('');
        setConfirmPassword('');
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
                    <h2 className="text-2xl font-bold text-slate-900">{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
                    <p className="mt-2 text-slate-600">
                        {isSignUp ? 'Get started with your free account.' : 'Enter your credentials to access your account.'}
                    </p>
                </div>
                <form onSubmit={handleFormSubmit} className="mt-8 space-y-4">
                    {isSignUp && (
                         <div>
                            <label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900"
                                placeholder="Jane Doe"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900"
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
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                     {isSignUp && (
                        <div>
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}
                    
                    <div className="pt-2">
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
                    </div>


                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading || !agreedToTerms}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <button onClick={toggleMode} className="font-medium text-indigo-600 hover:text-indigo-500">
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
        </>
    );
});