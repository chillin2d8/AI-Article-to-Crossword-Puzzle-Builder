import React from 'react';
import type { GeneratedData, UserTier } from '../../types';
import { BRAND_WATERMARK_LOGO_URI } from '../../config';

interface PuzzlePageProps {
  data: GeneratedData;
  showSolutions: boolean;
  tier: UserTier;
}

const CELL_SIZE = 22; // px

const PdfHeader: React.FC = () => (
    <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>PLAY ⚡</h2>
        <p style={{ fontSize: '10px', color: '#718096', margin: 0, marginTop: '2px' }}>
            Puzzle Learning Aids for Youth &bull; www.play-app.app
        </p>
    </div>
);

const PdfFooter: React.FC = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', color: '#a0aec0', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <span>Generated with play-app.app</span>
    </div>
);

const StaticCrosswordGrid: React.FC<{ gridData: GeneratedData['gridData'], showSolutions: boolean }> = ({ gridData, showSolutions }) => {
    const { grid, placedWords, rows, cols } = gridData;

    const wordNumbers: { [key: string]: number } = {};
    placedWords.forEach(word => {
        wordNumbers[`${word.row}-${word.col}`] = word.number;
    });
    
    const numberStyle: React.CSSProperties = {
        position: 'absolute',
        fontWeight: showSolutions ? 'normal' : 'bold',
        fontSize: showSolutions ? '4px' : '8px',
        top: '1px',
        left: '2px',
        color: '#4a5568'
    };

    const letterStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#1a202c'
    };
    
    return (
        <div 
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
                border: '2px solid #4a5568',
                margin: '0 auto',
            }}
        >
            {grid.map((gridRow, r) =>
                gridRow.map((cell, c) => {
                    if (!cell) {
                        return <div key={`${r}-${c}`} style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px`, backgroundColor: '#edf2f7', boxSizing: 'border-box' }}></div>;
                    }
                    const cellNumber = wordNumbers[`${r}-${c}`];

                    const cellStyle: React.CSSProperties = {
                        position: 'relative',
                        width: `${CELL_SIZE}px`,
                        height: `${CELL_SIZE}px`,
                        border: '1px solid #cbd5e0',
                        backgroundColor: '#fff',
                        boxSizing: 'border-box'
                    };

                    return (
                        <div key={`${r}-${c}`} style={cellStyle}>
                            {cellNumber && <div style={numberStyle}>{cellNumber}</div>}
                            <div style={letterStyle}>
                                {showSolutions ? cell : ''}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};


export const PuzzlePage: React.FC<PuzzlePageProps> = ({ data, showSolutions, tier }) => {
  const acrossClues = data.gridData.placedWords.filter(w => w.direction === 'across').sort((a,b) => a.number - b.number);
  const downClues = data.gridData.placedWords.filter(w => w.direction === 'down').sort((a,b) => a.number - b.number);
  const isFreeTier = tier === 'Free';

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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1a202c', marginBottom: '16px' }}>
            {data.title} - {showSolutions ? 'Solution' : 'Crossword Puzzle'}
          </h1>
          
          <div style={{ display: 'flex', flex: 1, gap: '20px', overflow: 'hidden' }}>
            {/* Left Column: Image and Across Clues */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!showSolutions && (
                <div>
                    <img 
                        src={data.imageUrlTwo} 
                        alt="Artistic representation of the topic" 
                        style={{ width: '100%', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                    />
                </div>
              )}
               <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Across</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {acrossClues.map(word => <li key={`across-${word.number}`} style={{ wordBreak: 'break-word' }}><span style={{fontWeight: 'bold'}}>{word.number}.</span> {word.clue}</li>)}
                  </ul>
              </div>
            </div>

            {/* Right Column: Grid and Down Clues */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <StaticCrosswordGrid gridData={data.gridData} showSolutions={showSolutions} />
              <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Down</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {downClues.map(word => <li key={`down-${word.number}`} style={{ wordBreak: 'break-word' }}><span style={{fontWeight: 'bold'}}>{word.number}.</span> {word.clue}</li>)}
                  </ul>
              </div>
            </div>
          </div>
           {isFreeTier ? (
              <PdfFooter />
           ) : (
             <div style={{ fontSize: '10px', textAlign: 'center', color: '#a0aec0', marginTop: 'auto', paddingTop: '16px' }}>
                 &nbsp;
             </div>
           )}
        </div>
    </div>
  );
};