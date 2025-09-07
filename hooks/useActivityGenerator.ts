import { useReducer, useState, useCallback, useEffect } from 'react';
import { GeneratedData, GeneratorState, GeneratorAction, ApiError, ContentError, PdfGenerationError, ImageSelection, ComprehensiveAnalysisData, UserTier, PuzzleType } from '../types';
import { generatePdf } from '../services/pdfService';
import { generateFreeActivityData, generateAnalysisData, assembleFinalData } from '../services/activityService';
import * as cloudFunctionsService from '../services/cloudFunctionsService';
import { PDF_CONFIG, UI_CONFIG, USER_TIERS } from '../config';
import { containsProfanity } from '../services/contentService';

const initialState: GeneratorState = {
  phase: 'input',
  loadingProgress: {},
  finalData: null,
  analysisData: null,
  error: null,
  activityId: null,
  pdfDownloadCompleted: false,
};

const generatorReducer = (state: GeneratorState, action: GeneratorAction): GeneratorState => {
  switch (action.type) {
    case 'GENERATE_START':
      return {
        ...state,
        phase: 'input',
        loadingProgress: { 'Initializer': 'Starting generation...' },
        error: null,
        pdfDownloadCompleted: false,
      };
    case 'FINALIZE_START':
      return {
        ...state,
        phase: 'selecting-images',
        loadingProgress: { 'Initializer': 'Finalizing activity...' },
        error: null,
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        loadingProgress: {
          ...state.loadingProgress,
          [action.payload.stage]: action.payload.message,
        },
      };
    case 'CLEAR_PROGRESS':
      return {
        ...state,
        loadingProgress: {},
      };
    case 'ANALYSIS_SUCCESS':
      return {
        ...state,
        phase: 'selecting-images',
        analysisData: action.payload,
        loadingProgress: {},
        error: null,
      }
    case 'GENERATE_SUCCESS':
        return {
            ...state,
            phase: 'final',
            finalData: action.payload.data,
            activityId: action.payload.id,
            analysisData: null,
            loadingProgress: {},
            error: null,
        }
    case 'GENERATE_ERROR':
      return {
        ...initialState,
        error: action.payload,
      };
    case 'FINALIZE_ERROR':
      return {
          ...state,
          loadingProgress: {},
          error: action.payload,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET':
      return {
          ...initialState,
      };
    case 'SET_ACTIVITY_FOR_VIEWING':
      return {
        ...initialState,
        phase: 'final',
        finalData: action.payload,
        activityId: action.payload.id || null,
      };
    case 'PDF_DOWNLOAD_START':
        return {
            ...state,
            pdfDownloadCompleted: false,
            loadingProgress: { ...state.loadingProgress, 'PDF Generation': 'Starting...' }
        };
    case 'PDF_DOWNLOAD_SUCCESS':
        return {
            ...state,
            pdfDownloadCompleted: true,
            loadingProgress: {},
        };
    default:
      return state;
  }
};

interface ActivityGeneratorProps {
    tier: UserTier;
}


export const useActivityGenerator = ({ tier }: ActivityGeneratorProps) => {
  const [state, dispatch] = useReducer(generatorReducer, initialState);
  const [articleText, setArticleText] = useState<string>('');
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const [gradeLevel, setGradeLevel] = useState<string>(UI_CONFIG.GRADE_LEVELS[1].value); // Default to 6th
  const [wordCount, setWordCount] = useState<number>(UI_CONFIG.WORD_COUNTS[1].value); // Default to 15
  const [puzzleType, setPuzzleType] = useState<PuzzleType>(UI_CONFIG.PUZZLE_TYPES[0].value); // Default to Crossword

  const tierConfig = USER_TIERS[tier];
  
  // Auto-clear input error when user starts typing
  useEffect(() => {
    if (state.phase === 'input' && state.error && articleText.length > 0) {
      dispatch({ type: 'CLEAR_ERROR' });
    }
  }, [articleText, state.error, state.phase]);

  const saveActivityWithModeration = async (data: GeneratedData): Promise<string> => {
    try {
      const result: any = await cloudFunctionsService.createActivity(data);
      if (!result.data.activityId) {
        throw new Error("Backend did not return an activity ID.");
      }
      return result.data.activityId;
    } catch (error: any) {
      // Re-throw specific, user-facing errors
      if (error.code === 'permission-denied') {
        throw new Error("This content violates our community guidelines and cannot be saved.");
      }
      console.error("Failed to save activity via Cloud Function:", error);
      // For other errors, throw a generic message
      throw new Error("Could not save the activity to your history. Please try again.");
    }
  };


  const handleGenerate = useCallback(async () => {
    if (containsProfanity(articleText)) {
      dispatch({ 
        type: 'GENERATE_ERROR', 
        payload: 'The provided text contains inappropriate language and cannot be processed. Please adhere to our community standards.' 
      });
      return;
    }

    if (!articleText.trim()) {
      dispatch({ type: 'GENERATE_ERROR', payload: 'Please paste an article first.' });
      return;
    }
    
    // Tier-based Generation Logic
    if (puzzleType === 'launchedition' && tier !== 'Yearly') {
        dispatch({
            type: 'GENERATE_ERROR',
            payload: 'The "Launch Edition Packet" is an exclusive feature for Yearly subscribers. Please upgrade your plan to use this feature.'
        });
        return;
    }

    dispatch({ type: 'GENERATE_START' });

    const updateProgress = (stage: string, message: string) => dispatch({ type: 'UPDATE_PROGRESS', payload: { stage, message } });
    const generationOptions = { gradeLevel, wordCount, puzzleType };

    try {
      if (tierConfig.permissions.isAutoGenerated) { // Free Tier
          const finalData = await generateFreeActivityData(articleText, generationOptions, updateProgress);
          const id = await saveActivityWithModeration(finalData);
          dispatch({ type: 'GENERATE_SUCCESS', payload: { data: { ...finalData, id }, id } });
      } else { // Monthly & Yearly Tiers
          const analysisData = await generateAnalysisData(articleText, generationOptions, updateProgress);
          dispatch({ type: 'ANALYSIS_SUCCESS', payload: analysisData });
          return; 
      }
    } catch (err) {
      console.error(err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
       if (err instanceof ContentError) {
          errorMessage = err.message;
      } else if (err instanceof ApiError) {
          const reason = (err.cause as any)?.message;
          errorMessage = `The AI service failed to process the request. Please check the article text and try again. ${reason ? `Reason: ${reason}`: ''}`;
      } else if (err instanceof Error) {
          errorMessage = err.message;
      }
      dispatch({ type: 'GENERATE_ERROR', payload: errorMessage });
    }
  }, [articleText, gradeLevel, wordCount, puzzleType, tierConfig, tier]);

  const handleFinalize = useCallback(async (selections: ImageSelection) => {
    if (!state.analysisData || !selections.one || !selections.two) {
      dispatch({ type: 'FINALIZE_ERROR', payload: 'Image selections are missing.' });
      return;
    }
    dispatch({ type: 'FINALIZE_START' });
    const updateProgress = (stage: string, message: string) => dispatch({ type: 'UPDATE_PROGRESS', payload: { stage, message } });

    try {
        const generationOptions = { gradeLevel, wordCount, puzzleType };
        const finalData = assembleFinalData(
            state.analysisData,
            selections,
            generationOptions,
            updateProgress
        );
        const id = await saveActivityWithModeration(finalData);
        dispatch({ type: 'GENERATE_SUCCESS', payload: { data: { ...finalData, id }, id } });
    } catch (err) {
        console.error("Error finalizing activity:", err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to assemble the activity sheet. Please try again.';
        dispatch({ type: 'FINALIZE_ERROR', payload: errorMessage });
    }
  }, [state.analysisData, gradeLevel, wordCount, puzzleType]);

  const handleDownloadPdf = useCallback(async () => {
    if (state.phase !== 'final' || !state.finalData) return;

    const wordCount = state.finalData.summary.split(/\s+/).filter(Boolean).length;
    if (wordCount < PDF_CONFIG.MIN_WORD_COUNT_WARNING) {
        const userConfirmed = window.confirm(
            `Warning: The summary has only ${wordCount} words. A minimum of ${PDF_CONFIG.MIN_WORD_COUNT_WARNING} is recommended for good formatting.\n\nDo you want to generate the PDF anyway?`
        );
        if (!userConfirmed) {
            return;
        }
    }
    
    dispatch({ type: 'PDF_DOWNLOAD_START' });
    const updatePdfProgress = (message: string) => dispatch({ type: 'UPDATE_PROGRESS', payload: { stage: 'PDF Generation', message } });
    
    try {
      await generatePdf(state.finalData, tier, updatePdfProgress);
      dispatch({ type: 'PDF_DOWNLOAD_SUCCESS' });
    } catch (err) {
      console.error("PDF Generation failed", err);
      let errorMessage = "Sorry, there was an error creating the PDF.";
      if (err instanceof PdfGenerationError) {
          errorMessage = err.message;
      }
      dispatch({ type: 'UPDATE_PROGRESS', payload: { stage: 'PDF Generation', message: 'Failed!' }});
      alert(errorMessage);
    }
  }, [state.finalData, state.phase, tier]);

  const handleReset = useCallback(() => {
      dispatch({ type: 'RESET' });
      setArticleText('');
      setShowSolutions(false);
      setGradeLevel(UI_CONFIG.GRADE_LEVELS[1].value);
      setWordCount(UI_CONFIG.WORD_COUNTS[1].value);
      setPuzzleType(UI_CONFIG.PUZZLE_TYPES[0].value);
  }, []);
  
  const setActivityForViewing = useCallback((data: GeneratedData) => {
    dispatch({ type: 'SET_ACTIVITY_FOR_VIEWING', payload: data });
  }, []);

  return {
    state,
    articleText,
    setArticleText,
    showSolutions,
    toggleSolutions: () => setShowSolutions(prev => !prev),
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
    setActivityForViewing,
  };
};
