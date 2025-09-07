import React from 'react';
import type { GeneratedData, UserTier, PlacedWordSearchWord, WordSearchVocabularyItem } from '../../types';
import { BRAND_WATERMARK_LOGO_URI } from '../../config';

interface WordSearchPageProps {
  data: GeneratedData;
  showSolutions: boolean;
  tier: UserTier;
}

const CELL_SIZE_PX = 22;

const PdfHeader: React.FC = React.memo(() => (
    <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>PLAY ⚡</h2>
        <p style={{ fontSize: '10px', color: '#718096', margin: 0, marginTop: '2px' }}>
            Puzzle Learning Aids for Youth &bull; www.play-app.app
        </p>
    </div>
));

const PdfFooter: React.FC = React.memo(() => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', color: '#a0aec0', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <span>Generated with play-app.app</span>
    </div>
));


const isCellInSolution = (row: number, col: number, placedWords: PlacedWordSearchWord[]): boolean => {
    for (const word of placedWords) {
        for (let i = 0; i < word.word.length; i++) {
            let r = word.row;
            let c = word.col;
            
            if (word.direction === 'horizontal') c += i;
            else if (word.direction === 'vertical') r += i;
            else if (word.direction === 'diagonal-down') { r += i; c += i; }
            else if (word.direction === 'diagonal-up') { r -= i; c += i; }
            else if (word.direction === 'horizontal-reverse') c -= i;
            else if (word.direction === 'vertical-reverse') r -= i;
            else if (word.direction === 'diagonal-down-reverse') { r -= i; c -= i; }
            else if (word.direction === 'diagonal-up-reverse') { r += i; c -= i; }
            
            if (r === row && c === col) {
                return true;
            }
        }
    }
    return false;
};


export const WordSearchPage: React.FC<WordSearchPageProps> = React.memo(({ data, showSolutions, tier }) => {
    const isFreeTier = tier === 'Free';
    const { grid, placedWords, wordList } = data.wordSearchData;

    if (!grid || grid.length === 0) {
        return <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>Word search data is not available.</div>;
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
                {isFreeTier && <PdfHeader />}
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1a202c', marginBottom: '20px' }}>
                    {data.title} - {showSolutions ? 'Solution' : 'Word Search'}
                </h1>
                
                {/* Top Half: Puzzle Grid */}
                <div style={{ flex: '1 1 50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${grid.length}, ${CELL_SIZE_PX}px)`,
                        gridAutoRows: `${CELL_SIZE_PX}px`,
                        border: '2px solid #4a5568',
                        paddingBottom: '2px',
                    }}>
                        {grid.map((row, r) =>
                            row.map((cell, c) => {
                                const isSolutionCell = showSolutions && isCellInSolution(r, c, placedWords);
                                return (
                                <div key={`${r}-${c}`} style={{
                                    width: `${CELL_SIZE_PX}px`,
                                    height: `${CELL_SIZE_PX}px`,
                                    backgroundColor: isSolutionCell ? '#FBBF24' : '#fff', // yellow-400
                                    boxSizing: 'border-box',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontFamily: 'monospace',
                                    fontWeight: 'bold',
                                    color: isSolutionCell ? '#92400E': '#1a202c', // amber-800
                                    paddingTop: '2px',
                                }}>
                                    {cell}
                                </div>
                            )})
                        )}
                    </div>
                </div>
                
                {/* Bottom Half: Word List */}
                <div style={{ flex: '1 1 50%', borderTop: '1px solid #e2e8f0', marginTop: '20px', paddingTop: '20px' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px', textAlign: 'center' }}>Words to Find</h3>
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        columns: '2',
                        columnGap: '40px',
                        fontSize: '11px',
                    }}>
                        {wordList.map(item => (
                            <li key={item.word} style={{ breakInside: 'avoid-column', marginBottom: '8px' }}>
                                <strong style={{ textTransform: 'uppercase' }}>{item.word}:</strong>
                                <span style={{ fontStyle: 'italic', marginLeft: '4px' }}>({item.clue_type}) {item.clue_text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {isFreeTier && <PdfFooter />}
            </div>
        </div>
    );
});