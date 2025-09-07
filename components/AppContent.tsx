import React, { useState } from 'react';
import { ArticleInput } from './ArticleInput';
import { GeneratedContent } from './GeneratedContent';
import { Header } from './Header';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageSelector } from './ImageSelector';
import { useActivityGenerator } from '../hooks/useActivityGenerator';
import { UserTier, GeneratedData } from '../types';
import { USER_TIERS, APP_CONFIG } from '../config';
import { SubscriptionManager } from './SubscriptionManager';
import { AccountManager } from './AccountManager';
import { Dashboard } from './Dashboard';
import type { User } from '@firebase/auth';

interface AppContentProps {
  user: User;
  tier: UserTier;
  onSignOut: () => void;
}

type View = 
    | { type: 'dashboard' }
    | { type: 'generator' }
    | { type: 'history'; data: GeneratedData };


export const AppContent: React.FC<AppContentProps> = ({ user, tier, onSignOut }) => {
  const {
    state,
    articleText,
    setArticleText,
    showSolutions,
    toggleSolutions,
    gradeLevel,
    setGradeLevel,
    wordCount,
    setWordCount,
    puzzleType,
    setPuzzleType,
    handleGenerate,
    handleFinalize,
    handleDownloadPdf,
    handleReset,
  } = useActivityGenerator({ tier });
  
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [isAccountModalOpen, setAccountModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>({ type: 'dashboard' });

  const isLoading = Object.keys(state.loadingProgress).length > 0;

  const handleStartNew = () => {
      handleReset();
      setCurrentView({ type: 'generator' });
  };
  
  const handleViewHistory = (data: GeneratedData) => {
      // We don't need to save this view, just display it.
      // The generator state needs to be populated with this data.
      // This is a simplified way to set the finalData for viewing.
      const viewState = {
          phase: 'final' as const,
          finalData: data,
          loadingProgress: {},
          analysisData: null,
          error: null,
      };
       // A bit of a hack to inject history data into the generator's state
      Object.assign(state, viewState);
      setCurrentView({ type: 'history', data });
  };
  
  const goToDashboard = () => {
      handleReset();
      setCurrentView({ type: 'dashboard' });
  };

  const renderCurrentView = () => {
    // If the generator is running, it takes precedence
    if (isLoading) {
        return <LoadingSpinner progress={state.loadingProgress} />;
    }

    if (state.error && !isLoading) {
        return (
            <div className="mt-4 text-center text-red-600 bg-red-100 p-4 rounded-lg border border-red-200">
              <p className="font-bold">An Error Occurred</p>
              <p>{state.error}</p>
            </div>
        );
    }

    // Handle generator phases
    switch (state.phase) {
        case 'final':
            return state.finalData ? (
                <GeneratedContent
                    data={state.finalData}
                    tier={tier}
                    onDownloadPdf={handleDownloadPdf}
                    showSolutions={showSolutions}
                    onToggleSolutions={toggleSolutions}
                    onStartOver={goToDashboard}
                    pdfLoadingProgress={state.loadingProgress}
                />
            ) : null;
        case 'selecting-images':
            return state.analysisData ? (
                <ImageSelector
                    analysisData={state.analysisData}
                    onComplete={handleFinalize}
                    onBack={handleReset}
                    tier={tier}
                />
            ) : null;
        case 'input':
             // When generator is in default state, decide which primary view to show
            switch(currentView.type) {
                case 'dashboard':
                    return <Dashboard user={user} tier={tier} onStartNew={handleStartNew} onViewHistory={handleViewHistory} onUpgrade={() => setSubscriptionModalOpen(true)} />;
                case 'generator':
                    return <ArticleInput
                        articleText={articleText}
                        setArticleText={setArticleText}
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                        gradeLevel={gradeLevel}
                        setGradeLevel={setGradeLevel}
                        wordCount={wordCount}
                        setWordCount={setWordCount}
                        puzzleType={puzzleType}
                        setPuzzleType={setPuzzleType}
                        tier={tier}
                    />;
                case 'history':
                    // This case is handled by the state.phase === 'final' block
                    return null;
                default:
                    return <Dashboard user={user} tier={tier} onStartNew={handleStartNew} onViewHistory={handleViewHistory} onUpgrade={() => setSubscriptionModalOpen(true)} />;
            }
        default:
            return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header 
        user={user}
        tier={tier}
        onSignOut={onSignOut}
        onManageAccount={() => setAccountModalOpen(true)}
        onGoToDashboard={goToDashboard}
      />
      
      {isSubscriptionModalOpen && (
        <SubscriptionManager 
          user={user}
          tier={tier}
          onClose={() => setSubscriptionModalOpen(false)}
        />
      )}
      
      {isAccountModalOpen && (
        <AccountManager
          user={user}
          tier={tier}
          onClose={() => setAccountModalOpen(false)}
          onManageSubscription={() => {
              setAccountModalOpen(false);
              setSubscriptionModalOpen(true);
          }}
        />
      )}

      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-slate-200">
          {renderCurrentView()}
        </div>
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>
            Love PLAY? Consider supporting its development.{' '}
            <a 
              href={APP_CONFIG.DONATION_LINK_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 hover:underline font-semibold"
            >
              Buy me a coffee
            </a>
            .
          </p>
        </footer>
      </main>
    </div>
  );
};