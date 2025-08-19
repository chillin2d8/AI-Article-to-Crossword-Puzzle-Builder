
import React from 'react';
import type { GeneratedData } from '../../types';

interface StoryPageProps {
  data: GeneratedData;
}

export const StoryPage: React.FC<StoryPageProps> = ({ data }) => {
  const summaryParagraphs = data.summary_6th_grade.split('\n').filter(p => p.trim() !== '');

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#2d3748', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1a202c', marginBottom: '20px' }}>
        {data.title}
      </h1>

      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        <img 
            src={data.imageUrlTwo} 
            alt="Comic representation of the topic" 
            style={{ 
                float: 'right',
                width: '40%',
                marginLeft: '15px',
                marginBottom: '10px',
                border: '3px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
        />
        {summaryParagraphs.map((paragraph, index) => (
            <p key={index} style={{ fontSize: '12px', lineHeight: '1.6', marginBottom: '10px', textAlign: 'justify' }}>
                {paragraph}
            </p>
        ))}
      </div>
      
       <div style={{ fontSize: '10px', textAlign: 'center', color: '#a0aec0', marginTop: 'auto', paddingTop: '16px' }}>
            AI Crossword Generator
       </div>
    </div>
  );
};
