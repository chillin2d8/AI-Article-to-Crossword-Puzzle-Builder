import React from 'react';
import type { GeneratedData, UserTier } from '../../types';
import { BRAND_WATERMARK_LOGO_URI } from '../../config';

interface StoryPageProps {
  data: GeneratedData;
  tier: UserTier;
}

const PdfHeader: React.FC = () => (
    <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
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

export const StoryPage: React.FC<StoryPageProps> = ({ data, tier }) => {
  const summaryParagraphs = data.summary.split('\n').filter(p => p.trim() !== '');
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
          
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1a202c', marginBottom: '20px' }}>
            {data.title}
          </h1>

          <div style={{ flexGrow: 1, overflow: 'hidden' }}>
            <img 
                src={data.imageUrlOne} 
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