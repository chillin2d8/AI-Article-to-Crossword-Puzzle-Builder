import React, { useMemo } from 'react';
import type { GeneratedData, UserTier } from '../../types';
import { BRAND_WATERMARK_LOGO_URI } from '../../config';

interface WordScramblePageProps {
  data: GeneratedData;
  showSolutions: boolean;
  tier: UserTier;
}

const PdfHeader: React.FC<{ isFreeTier: boolean }> = React.memo(({ isFreeTier }) => {
    if (!isFreeTier) return null;
    return (
        <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>PLAY ⚡</h2>
            <p style={{ fontSize: '10px', color: '#718096', margin: 0, marginTop: '2px' }}>
                Puzzle Learning Aids for Youth &bull; www.play-app.app
            </p>
        </div>
    );
});

const PdfFooter: React.FC<{ isFreeTier: boolean }> = React.memo(({ isFreeTier }) => {
    if (!isFreeTier) {
        return (
             <div style={{ fontSize: '10px', textAlign: 'center', color: '#a0aec0', marginTop: 'auto', paddingTop: '16px' }}>
                 &nbsp;
             </div>
        );
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', color: '#a0aec0', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <span>Generated with play-app.app</span>
        </div>
    );
});

export const WordScramblePage: React.FC<WordScramblePageProps> = React.memo(({ data, showSolutions, tier }) => {
    const isFreeTier = tier === 'Free';
    const { wordList } = data.wordScrambleData;
    
    const randomizedClues = useMemo(() => {
        const wordsWithOriginalIndex = wordList.map((word, index) => ({ ...word, originalIndex: index }));
        // Simple seedable random function for consistency between renders
        let seed = 1;
        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
        return [...wordsWithOriginalIndex].sort(() => random() - 0.5);
    }, [wordList]);

    if (!wordList || wordList.length === 0) {
        return <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>Word Scramble data is not available.</div>;
    }

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#2d3748', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            {isFreeTier && (
                 <>
                    <div style={{ position: 'absolute', left: '0px', top: '0', bottom: '0', width: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, zIndex: 10 }}>
                        <img src={BRAND_WATERMARK_LOGO_URI} style={{ height: '70%', objectFit: 'contain' }} alt="" />
                    </div>
                    <div style={{ position: 'absolute', right: '0px', top: '0', bottom: '0', width: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, zIndex: 10 }}>
                        <img src={BRAND_WATERMARK_LOGO_URI} style={{ height: '70%', objectFit: 'contain' }} alt="" />
                    </div>
                </>
            )}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <PdfHeader isFreeTier={isFreeTier} />
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1a202c', marginBottom: '16px' }}>
                    {data.title} - {showSolutions ? 'Solution' : 'Word Scramble'}
                </h1>

                {!showSolutions && (
                    <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                        <img 
                            src={data.imageUrlTwo} 
                            alt="Artistic representation of the topic" 
                            style={{ 
                                maxWidth: '50%', 
                                margin: '0 auto',
                                border: '2px solid #e2e8f0', 
                                borderRadius: '8px' 
                            }}
                        />
                    </div>
                )}
                
                <div style={{ display: 'flex', flex: '1 1 auto', gap: '30px', overflow: 'hidden' }}>
                    {/* Left Column: Scrambled Words */}
                    <div style={{ flex: 1 }}>
                         <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px', borderBottom: '1px solid #cbd5e0', paddingBottom: '6px' }}>
                            Unscramble the Words
                        </h4>
                        <ol style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px' }}>
                            {wordList.map((item, index) => (
                                <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                                    <span style={{ color: '#4a5568', fontWeight: 'bold' }}>{index + 1}.</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', color: '#4338ca' }}>
                                        {item.scrambled_word}
                                    </span>
                                    <div style={{ flex: 1, borderBottom: '1px solid #718096', paddingTop: '4px', textAlign: 'center', fontFamily: 'monospace', letterSpacing: '2px', color: '#1e3a8a', fontWeight: 'bold' }}>
                                        {showSolutions ? item.word : <span>&nbsp;</span>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Right Column: Clues */}
                    <div style={{ flex: 1 }}>
                         <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px', borderBottom: '1px solid #cbd5e0', paddingBottom: '6px' }}>
                            Match the Clue
                        </h4>
                        <p style={{ fontSize: '10px', color: '#718096', marginBottom: '8px' }}>Write the number of the scrambled word next to its matching clue.</p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '10px' }}>
                             {randomizedClues.map((clue, clueIndex) => (
                                <li key={clueIndex} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <div style={{ width: '24px', height: '24px', border: '1px solid #718096', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', color: '#1e3a8a' }}>
                                        {showSolutions ? clue.originalIndex + 1 : ''}
                                    </div>
                                    <span style={{ flex: 1, lineHeight: '1.3' }}>
                                        <span style={{ color: '#718096', fontStyle: 'italic', textTransform: 'capitalize' }}>({clue.clue_type})</span> {clue.clue_text}
                                    </span>
                                </li>
                             ))}
                        </ul>
                    </div>
                </div>

                <PdfFooter isFreeTier={isFreeTier} />
            </div>
        </div>
    );
});