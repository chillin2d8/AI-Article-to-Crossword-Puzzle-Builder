import React from 'react';
import type { GeneratedData, PlacedWord } from '../../types';

interface PuzzlePageProps {
  data: GeneratedData;
  showSolutions: boolean;
}

const CELL_SIZE = 22; // px

const StaticCrosswordGrid: React.FC<{ gridData: GeneratedData['gridData'], showSolutions: boolean }> = ({ gridData, showSolutions }) => {
    const { grid, placedWords, rows, cols } = gridData;

    const wordNumbers: { [key: string]: number } = {};
    placedWords.forEach(word => {
        wordNumbers[`${word.row}-${word.col}`] = word.number;
    });
    
    return (
        <div 
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
                border: '2px solid #333',
                margin: '0 auto', // Center the grid in its container
            }}
        >
            {grid.map((gridRow, r) =>
                gridRow.map((cell, c) => {
                    if (!cell) {
                        return <div key={`${r}-${c}`} style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px`, backgroundColor: '#fff', boxSizing: 'border-box' }}></div>;
                    }
                    const cellNumber = wordNumbers[`${r}-${c}`];

                    const cellStyle: React.CSSProperties = {
                        position: 'relative',
                        width: `${CELL_SIZE}px`,
                        height: `${CELL_SIZE}px`,
                        border: showSolutions ? '1px solid transparent' : '1px solid #aaa',
                        backgroundColor: '#fff',
                        boxSizing: 'border-box'
                    };

                    return (
                        <div key={`${r}-${c}`} style={cellStyle}>
                            {cellNumber && <div style={{ position: 'absolute', top: '-2px', left: '3px', fontSize: '8px', fontWeight: 'bold' }}>{cellNumber}</div>}
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', fontSize: '8px', textTransform: 'uppercase', paddingTop: '2px' }}>
                                {showSolutions ? cell : ''}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};


export const PuzzlePage: React.FC<PuzzlePageProps> = ({ data, showSolutions }) => {
  const acrossClues = data.gridData.placedWords.filter(w => w.direction === 'across').sort((a,b) => a.number - b.number);
  const downClues = data.gridData.placedWords.filter(w => w.direction === 'down').sort((a,b) => a.number - b.number);

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', borderBottom: '2px solid #ddd', paddingBottom: '8px', marginBottom: '16px' }}>
        {data.title} - {showSolutions ? 'Solution' : 'Crossword Puzzle'}
      </h1>
      
      <div style={{ display: 'flex', flex: 1, gap: '20px' }}>
        {/* Left Column: Image and Across Clues */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!showSolutions && (
            <div>
                <img 
                    src={data.imageUrlOne} 
                    alt="Artistic representation of the topic" 
                    style={{ maxWidth: '100%', border: '2px solid #ccc', borderRadius: '8px' }}
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

      <div style={{ fontSize: '10px', textAlign: 'center', color: '#888', marginTop: 'auto', paddingTop: '16px' }}>
            AI Crossword Generator
       </div>
    </div>
  );
};