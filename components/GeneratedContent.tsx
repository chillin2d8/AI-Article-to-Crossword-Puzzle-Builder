import React from 'react';
import type { GeneratedData, UserTier } from '../types';
import { Crossword } from './Crossword';
import { WordSearch } from './WordSearch';
import { WordScramble } from './WordScramble';
import { UI_CONFIG } from '../config';

interface GeneratedContentProps {
  data: GeneratedData;
  tier: UserTier;
  onDownloadPdf: () => void;
  showSolutions: boolean;
  onToggleSolutions: () => void;
  onStartOver: () => void;
  pdfLoadingProgress?: { [key: string]: string };
}

const OnScreenBrandingHeader: React.FC = () => (
    <div className="hidden print:block text-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">PLAY ⚡</h2>
        <p className="text-sm text-slate-500">Puzzle Learning Aids for Youth &bull; www.play-app.app</p>
    </div>
);

const OnScreenBrandingFooter: React.FC = () => (
    <div className="hidden print:flex justify-between items-center text-xs text-slate-400 mt-6 pt-4 border-t">
        <span>Generated with play-app.app</span>
    </div>
);


export const GeneratedContent: React.FC<GeneratedContentProps> = React.memo(({ 
    data, 
    tier,
    onDownloadPdf, 
    onToggleSolutions, 
    showSolutions,
    onStartOver,
    pdfLoadingProgress
}) => {
  const acrossClues = data.gridData.placedWords
    .filter(w => w.direction === 'across')
    .sort((a, b) => a.number - b.number);
  const downClues = data.gridData.placedWords
    .filter(w => w.direction === 'down')
    .sort((a, b) => a.number - b.number);
  
  const wordCount = data.summary.split(/\s+/).filter(Boolean).length;
  const pdfProgressMessage = pdfLoadingProgress?.['PDF Generation'];
  const gradeLabel = UI_CONFIG.GRADE_LEVELS.find(g => g.value === data.gradeLevel)?.label || `${data.gradeLevel}th Grade`;
  
  const isFreeTier = tier === 'Free';
  const isWordSearch = data.puzzleType === 'wordsearch';
  const isWordScramble = data.puzzleType === 'wordscramble';
  const isLaunchEdition = data.puzzleType === 'launchedition';
  
  const crosswordTitle = `${data.title} - Crossword`;
  const wordSearchTitle = `${data.title} - Word Search`;
  // FIX: Corrected an unterminated template literal. Replaced the closing single quote with a backtick. This resolves numerous cascading type errors.
  const wordScrambleTitle = `${data.title} - Word Scramble`;
  const launchEditionTitle = `${data.title} - Launch Edition Packet`;

  const hasCrosswordData = data.gridData.placedWords.length > 0;
  const hasWordSearchData = (data.wordSearchData?.wordList?.length || 0) > 0;
  const hasWordScrambleData = (data.wordScrambleData?.wordList?.length || 0) > 0;

  const hasPuzzle = isLaunchEdition
    ? (hasCrosswordData || hasWordSearchData || hasWordScrambleData)
    : isWordSearch
    ? hasWordSearchData
    : isWordScramble
    ? hasWordScrambleData
    : hasCrosswordData;

  return (
    <>
      {isFreeTier && <OnScreenBrandingHeader />}
      <div className="flex flex-col gap-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <h2 className="text-2xl font-bold text-slate-800">{data.title} - Activity Sheet</h2>
          <div className="flex items-center justify-start sm:justify-end gap-2 flex-wrap">
              <button 
                  onClick={onStartOver}
                  className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-100 transition-colors text-sm"
              >
                  Back to Dashboard
              </button>
              {hasPuzzle && (
                <button 
                    onClick={onToggleSolutions}
                    className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-100 transition-colors text-sm"
                >
                    {showSolutions ? 'Hide Solutions' : 'Show Solutions'}
                </button>
              )}
              <button
                  onClick={onDownloadPdf}
                  disabled={!!pdfProgressMessage}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-colors text-sm disabled:bg-slate-400 disabled:cursor-wait"
              >
                  {pdfProgressMessage || 'Download PDF'}
              </button>
          </div>
        </div>

        {data.crosswordWarning && (
          <div className="my-4 text-center text-amber-800 bg-amber-100 p-4 rounded-lg border border-amber-200">
            <p className="font-semibold">Puzzle Notice</p>
            <p className="text-sm">{data.crosswordWarning}</p>
          </div>
        )}
        
        <div className="border-t border-b border-slate-200 py-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Summary</h3>
          <div className="flex items-center space-x-4 text-xs text-slate-500 mb-4 font-medium">
            <div className="flex items-center space-x-1.5" title="Reading Level">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.76l7 3.5a1 1 0 00.732 0l7-3.5a1 1 0 00.028-1.76l-7-3.5z" />
                <path d="M10 11.562l-7-3.5V12a1 1 0 001 1h12a1 1 0 001-1V8.062l-7 3.5zM3 13.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5A23.16 23.16 0 0110 15c-2.43 0-4.633-.35-6.52-1H3.52z" />
              </svg>
              <span>{gradeLabel} Reading Level</span>
            </div>
            <div className="flex items-center space-x-1.5" title="Word Count">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2-2H6a2 2 0 01-2-2V4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7zm1 4a1 1 0 100 2h3a1 1 0 100-2H8z" clipRule="evenodd" />
              </svg>
              <span>{wordCount} Words</span>
            </div>
          </div>
          <div className="flow-root">
              <div className="md:w-2/5 md:float-right md:ml-6 mb-4">
                  <img src={data.imageUrlOne} alt="Selected representation for the summary" className="rounded-xl shadow-lg border-4 border-white w-full" />
              </div>
              <p className="text-slate-700 leading-relaxed text-sm text-justify">{data.summary}</p>
          </div>
        </div>
        
        {hasPuzzle && (
          <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">{
                  isLaunchEdition ? launchEditionTitle :
                  isWordSearch ? wordSearchTitle : 
                  isWordScramble ? wordScrambleTitle : 
                  crosswordTitle
              }</h3>
              <div className="w-full max-w-lg mx-auto mb-6">
                  <img src={data.imageUrlTwo} alt="Selected representation for the puzzle" className="rounded-xl shadow-lg border-4 border-white" />
              </div>

              { (data.puzzleType === 'crossword' || isLaunchEdition) && hasCrosswordData && (
                  <div className={isLaunchEdition ? "mt-12 pt-8 border-t-2 border-dashed border-slate-300" : ""}>
                      {isLaunchEdition && <h4 className="text-xl font-bold text-slate-800 mb-6 text-center">{crosswordTitle}</h4>}
                      <div className="flex justify-center">
                          <Crossword gridData={data.gridData} showSolutions={showSolutions} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 max-w-4xl mx-auto">
                          <div>
                              <h3 className="font-bold text-lg mb-2 text-slate-700">Across</h3>
                              <ul className="space-y-2 text-sm text-slate-600">
                                  {acrossClues.map(word => (
                                  <li key={`across-${word.number}`} className="p-1">
                                      <span className="font-bold">{word.number}.</span> {word.clue_text}
                                  </li>
                                  ))}
                              </ul>
                          </div>
                          <div>
                              <h3 className="font-bold text-lg mb-2 text-slate-700">Down</h3>
                              <ul className="space-y-2 text-sm text-slate-600">
                                  {downClues.map(word => (
                                  <li key={`down-${word.number}`} className="p-1">
                                      <span className="font-bold">{word.number}.</span> {word.clue_text}
                                  </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  </div>
              )}

              { (data.puzzleType === 'wordsearch' || isLaunchEdition) && hasWordSearchData && (
                   <div className={isLaunchEdition ? "mt-12 pt-8 border-t-2 border-dashed border-slate-300" : ""}>
                      {isLaunchEdition && <h4 className="text-xl font-bold text-slate-800 mb-6 text-center">{wordSearchTitle}</h4>}
                      <div className="flex justify-center">
                        <WordSearch 
                            wordSearchData={data.wordSearchData}
                            showSolutions={showSolutions} 
                        />
                      </div>
                      <div className="mt-8 max-w-4xl mx-auto px-4">
                          <h3 className="font-bold text-lg mb-4 text-slate-700 text-center">Words to Find</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                              {data.wordSearchData.wordList.map(item => (
                                  <div key={item.word}>
                                      <strong className="font-semibold text-slate-800 uppercase">{item.word}:</strong>
                                      <span className="text-slate-600 italic ml-2">({item.clue_type}) {item.clue_text}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              { (data.puzzleType === 'wordscramble' || isLaunchEdition) && hasWordScrambleData && (
                  <div className={isLaunchEdition ? "mt-12 pt-8 border-t-2 border-dashed border-slate-300" : ""}>
                      {isLaunchEdition && <h4 className="text-xl font-bold text-slate-800 mb-6 text-center">{wordScrambleTitle}</h4>}
                      <div className="max-w-4xl mx-auto">
                        <WordScramble 
                          wordScrambleData={data.wordScrambleData}
                          showSolutions={showSolutions}
                        />
                      </div>
                  </div>
              )}

          </div>
        )}
      </div>
      {isFreeTier && <OnScreenBrandingFooter />}
    </>
  );
});