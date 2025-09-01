
import React, { useState } from 'react';
import { ArticleInput } from './ArticleInput';
import { GeneratedContent } from './GeneratedContent';
import { Header } from './Header';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageSelector } from './ImageSelector';
import { useActivityGenerator } from '../hooks/useActivityGenerator';
import { UserTier } from '../types';
import { USER_TIERS, APP_CONFIG } from '../config';
import { SubscriptionManager } from './SubscriptionManager';

interface AppContentProps {
  tier: UserTier;
  onSignOut: () => void;
}

export const AppContent: React.FC<AppContentProps> = ({ tier, onSignOut }) => {
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
    handleGenerate,
    handleFinalize,
    handleDownloadPdf,
    handleReset,
    handleSummaryChange,
  } = useActivityGenerator({ tier });
  
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  const isLoading = Object.keys(state.loadingProgress).length > 0;
  const tierConfig = USER_TIERS[tier];

  const renderContent = () => {
    switch (state.phase) {
      case 'final':
        return state.finalData ? (
          <GeneratedContent
            data={state.finalData}
            tier={tier}
            onDownloadPdf={handleDownloadPdf}
            showSolutions={showSolutions}
            onToggleSolutions={toggleSolutions}
            onReset={handleReset}
            onSummaryChange={handleSummaryChange}
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
      default:
        return (
          <ArticleInput
            articleText={articleText}
            setArticleText={setArticleText}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            gradeLevel={gradeLevel}
            setGradeLevel={setGradeLevel}
            wordCount={wordCount}
            setWordCount={setWordCount}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header 
        tierName={tierConfig.name} 
        onSignOut={onSignOut}
        onManageSubscription={() => setSubscriptionModalOpen(true)}
        tier={tier}
      />
      
      {isSubscriptionModalOpen && (
        <SubscriptionManager 
          tier={tier}
          onClose={() => setSubscriptionModalOpen(false)}
        />
      )}

      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-slate-200">
          {isLoading && <LoadingSpinner progress={state.loadingProgress} />}
          
          {!isLoading && renderContent()}

          {state.error && !isLoading && (
            <div className="mt-4 text-center text-red-600 bg-red-100 p-4 rounded-lg border border-red-200">
              <p className="font-bold">An Error Occurred</p>
              <p>{state.error}</p>
            </div>
          )}
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