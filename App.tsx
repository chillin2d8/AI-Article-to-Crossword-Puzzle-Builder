
import React, { useState, useCallback } from 'react';
import { ArticleInput } from './components/ArticleInput';
import { GeneratedContent } from './components/GeneratedContent';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeArticle, generateImage } from './services/geminiService';
import { generateGrid } from './services/crosswordService';
import { generatePdf } from './services/pdfService';
import type { GeneratedData, AnalysisResult } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [articleText, setArticleText] = useState<string>('');
  const [showSolutions, setShowSolutions] = useState<boolean>(false);

  const handleGenerate = useCallback(async () => {
    if (!articleText.trim()) {
      setError('Please paste an article first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedData(null);
    setShowSolutions(false);

    try {
      setLoadingMessage('Analyzing article for key terms...');
      const analysisResult: AnalysisResult = await analyzeArticle(articleText);

      if (!analysisResult.crossword_words || analysisResult.crossword_words.length < 5) {
        throw new Error("Could not extract enough keywords to build a crossword. Try a different article.");
      }
      
      setLoadingMessage('Building crossword grid...');
      await new Promise(res => setTimeout(res, 500));
      const gridData = generateGrid(analysisResult.crossword_words);

      if (!gridData || gridData.placedWords.length < 5) {
        throw new Error("Failed to construct a good crossword puzzle from the keywords.");
      }

      setLoadingMessage('Generating comic book images...');
      const [imageUrlOne, imageUrlTwo] = await Promise.all([
          generateImage(analysisResult.image_prompt_one, '4:3'),
          generateImage(analysisResult.image_prompt_two, '4:3')
      ]);
      
      const originalWordCount = articleText.trim().split(/\s+/).length;
      const summaryWordCount = analysisResult.summary_6th_grade.trim().split(/\s+/).length;
      
      setGeneratedData({
        summary: analysisResult.summary,
        summary_6th_grade: analysisResult.summary_6th_grade,
        imageUrlOne,
        imageUrlTwo,
        gridData,
        title: analysisResult.title,
        originalWordCount,
        summaryWordCount,
        originalGradeLevel: analysisResult.originalGradeLevel,
        summaryGradeLevel: analysisResult.summaryGradeLevel,
        image_prompt_one: analysisResult.image_prompt_one,
        image_prompt_two: analysisResult.image_prompt_two,
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [articleText]);

  const handleDownloadPdf = useCallback(async () => {
    if (!generatedData) return;
    setIsLoading(true);
    setLoadingMessage('Generating PDF pages...');
    setError(null);
    try {
        await generatePdf(generatedData);
    } catch (err) {
        console.error("PDF Generation failed", err);
        setError("Sorry, there was an error creating the PDF.");
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [generatedData]);

  const handleRegenerateImage = useCallback(async (imageType: 'summary' | 'crossword') => {
    if (!generatedData) return;

    setIsLoading(true); 
    setLoadingMessage(`Generating new ${imageType} image...`);
    setError(null);

    try {
        // 'summary' page uses imageTwo, 'crossword' page uses imageOne
        const prompt = imageType === 'summary' ? generatedData.image_prompt_two : generatedData.image_prompt_one;
        const enhancedPrompt = `Generate a completely new and different image. It should be a creative variation based on this core idea: "${prompt}"`;
        const newImageUrl = await generateImage(enhancedPrompt, '4:3');

        setGeneratedData(prevData => {
            if (!prevData) return null;
            return {
                ...prevData,
                ...(imageType === 'summary' ? { imageUrlTwo: newImageUrl } : { imageUrlOne: newImageUrl })
            };
        });

    } catch (err) {
        console.error(err);
        setError(`Failed to regenerate the ${imageType} image.`);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [generatedData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200">
          <ArticleInput
            articleText={articleText}
            setArticleText={setArticleText}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          {isLoading && <LoadingSpinner message={loadingMessage} />}
          {error && <div className="mt-6 text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>}
          {generatedData && !isLoading && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <GeneratedContent 
                data={generatedData} 
                onDownloadPdf={handleDownloadPdf}
                showSolutions={showSolutions}
                onToggleSolutions={() => setShowSolutions(prev => !prev)}
                isGenerating={isLoading}
                onRegenerateImage={handleRegenerateImage}
              />
            </div>
          )}
        </div>
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by AI. Generated content may not be accurate.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;