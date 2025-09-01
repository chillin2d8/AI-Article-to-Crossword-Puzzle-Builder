
import React, { useState, useEffect } from 'react';
import { AppContent } from './components/AppContent';
import { AuthPage } from './components/AuthPage';
import { UserTier } from './types';
import * as authService from './services/authService';
// FIX: Updated Firebase auth import to use the @firebase scoped package.
import type { User } from '@firebase/auth';

// Import all the new targeted landing pages
import { MainLandingPage } from './components/landing/MainLandingPage';
import { HomeschoolPage } from './components/landing/HomeschoolPage';
import { SundaySchoolPage } from './components/landing/SundaySchoolPage';
import { ElementarySchoolPage } from './components/landing/ElementarySchoolPage';
import { PrivateSchoolPage } from './components/landing/PrivateSchoolPage';
import { CharterSchoolPage } from './components/landing/CharterSchoolPage';
import { TermsOfServicePage } from './components/legal/TermsOfServicePage';
import { PrivacyPolicyPage } from './components/legal/PrivacyPolicyPage';

import { db, isFirebaseConfigured } from './firebaseConfig';
// FIX: Updated Firebase firestore import to use the @firebase scoped package for consistency.
import { collection, query, where, onSnapshot, Unsubscribe } from '@firebase/firestore';
import { USER_TIERS } from './config';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<UserTier | null>(null);
  const [authFlowActive, setAuthFlowActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let firestoreUnsubscribe: Unsubscribe | null = null;

    const authUnsubscribe = authService.onAuthChange((firebaseUser) => {
      setUser(firebaseUser);

      if (firestoreUnsubscribe) {
          firestoreUnsubscribe();
          firestoreUnsubscribe = null;
      }

      if (firebaseUser) {
        // If Firebase is not configured, fall back to the original simulation logic for development.
        if (!isFirebaseConfigured || !db) {
            console.log("Using simulated user tiers because Firebase is not configured.");
            const adminEmails = ['admin@play-app.app'];
            const monthlyEmails = ['monthly@test.com'];

            if (firebaseUser.email && adminEmails.includes(firebaseUser.email)) {
              setTier('Yearly');
            } else if (firebaseUser.email && monthlyEmails.includes(firebaseUser.email)) {
              setTier('Monthly');
            } else {
              setTier('Free');
            }
            setIsLoading(false);
            return;
        }

        // --- REAL SUBSCRIPTION LOGIC ---
        // Listen for active subscriptions from the Stripe Firebase Extension
        const subscriptionsRef = collection(db, 'customers', firebaseUser.uid, 'subscriptions');
        const q = query(subscriptionsRef, where("status", "in", ["trialing", "active"]));
        
        firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                // No active subscriptions found
                setTier('Free');
            } else {
                // Get the product name from the first active subscription
                const subscription = snapshot.docs[0].data();
                const productName = subscription.items[0].price.product.name;

                if (productName === USER_TIERS.Monthly.name) {
                    setTier('Monthly');
                } else if (productName === USER_TIERS.Yearly.name) {
                    setTier('Yearly');
                } else {
                    console.warn(`Unknown product name: "${productName}". Defaulting to Free.`);
                    setTier('Free');
                }
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Subscription listener error:", error);
            setTier('Free'); // Default to Free tier on error
            setIsLoading(false);
        });

        setAuthFlowActive(false);

      } else {
        // User is logged out
        setTier(null);
        setIsLoading(false);
      }
    });

    return () => {
        authUnsubscribe();
        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
        }
    };
  }, []);

  const handleStartAuth = () => {
    setAuthFlowActive(true);
  };

  const handleSignOut = async () => {
    await authService.logOut();
    setAuthFlowActive(false);
  };
  
  const renderLandingPage = () => {
    const path = window.location.pathname;
    switch (path) {
      case '/homeschool':
        return <HomeschoolPage onStartAuth={handleStartAuth} />;
      case '/sundayschool':
        return <SundaySchoolPage onStartAuth={handleStartAuth} />;
      case '/elementary':
        return <ElementarySchoolPage onStartAuth={handleStartAuth} />;
      case '/private':
        return <PrivateSchoolPage onStartAuth={handleStartAuth} />;
      case '/charter':
        return <CharterSchoolPage onStartAuth={handleStartAuth} />;
      case '/terms':
        return <TermsOfServicePage onStartAuth={handleStartAuth} pageType="legal" />;
      case '/privacy':
        return <PrivacyPolicyPage onStartAuth={handleStartAuth} pageType="legal" />;
      default:
        return <MainLandingPage onStartAuth={handleStartAuth} />;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user && tier) {
    return <AppContent tier={tier} onSignOut={handleSignOut} />;
  }
  
  if (authFlowActive) {
    return <AuthPage onBack={() => setAuthFlowActive(false)} />;
  }

  return renderLandingPage();
};

export default App;