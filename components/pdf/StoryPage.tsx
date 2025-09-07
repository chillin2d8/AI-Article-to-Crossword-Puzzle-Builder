import React from 'react';
import type { GeneratedData, UserTier } from '../../types';
import { BRAND_WATERMARK_LOGO_URI } from '../../config';

interface StoryPageProps {
  data: GeneratedData;
  tier: UserTier;
}

const PdfHeader: React.FC<{ title: string; isFreeTier: boolean }> = React.memo(({ title, isFreeTier }) => (
    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
        {isFreeTier && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>PLAY ⚡</h2>
                    <p style={{ fontSize: '10px', color: '#718096', margin: 0, marginTop: '2px' }}>
                        Puzzle Learning Aids for Youth
                    </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#718096' }}>
                    www.play-app.app
                </div>
            </div>
        )}
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a202c', marginTop: isFreeTier ? '16px' : '0', textAlign: 'center' }}>
            {title}
        </h1>
    </div>
));

const PdfFooter: React.FC = React.memo(() => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', color: '#a0aec0', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <span>Generated with play-app.app</span>
    </div>
));

export const StoryPage: React.FC<StoryPageProps> = React.memo(({ data, tier }) => {
  // Ensure paragraphs are split by one or more newlines for robustness
  const summaryParagraphs = data.summary.split(/\n\s*\n/).filter(p => p.trim() !== '');
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
          <PdfHeader title={data.title} isFreeTier={isFreeTier} />
          
          <div style={{ flexGrow: 1, overflow: 'hidden', textAlign: 'justify' }}>
              <img 
                  src={data.imageUrlOne} 
                  alt="Primary representation of the topic" 
                  style={{ 
                      float: 'left',
                      width: '45%',
                      marginRight: '20px',
                      marginBottom: '10px',
                      border: '3px solid #e2e8f0', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
              />
            {summaryParagraphs.map((paragraph, index) => (
                <p key={index} style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
                    {paragraph}
                </p>
            ))}
          </div>
          
          {isFreeTier && <PdfFooter />}
      </div>
    </div>
  );
});