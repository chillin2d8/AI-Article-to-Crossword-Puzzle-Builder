

import React from 'react';
import { LandingPageLayout } from './LandingPageLayout';

interface LandingPageProps {
  onStartAuth: () => void;
}

const ReviewLinks: React.FC = React.memo(() => (
    <div className="mt-6 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg text-center">
        <h3 className="font-bold text-yellow-200">Review Links (For Development)</h3>
        <p className="text-sm text-yellow-300 mb-2">Use these links to view the different targeted landing pages.</p>
        <div className="flex justify-center gap-4 flex-wrap text-sm">
            <a href="/" className="font-semibold text-indigo-400 hover:underline">Default</a>
            <a href="/homeschool" className="font-semibold text-indigo-400 hover:underline">Homeschool</a>
            <a href="/sundayschool" className="font-semibold text-indigo-400 hover:underline">Sunday School</a>
            <a href="/elementary" className="font-semibold text-indigo-400 hover:underline">Elementary</a>
            <a href="/private" className="font-semibold text-indigo-400 hover:underline">Private School</a>
            <a href="/charter" className="font-semibold text-indigo-400 hover:underline">Charter School</a>
        </div>
    </div>
));

export const MainLandingPage: React.FC<LandingPageProps> = React.memo(({ onStartAuth }) => {
    const heroContent = (
        <section className="text-center py-20 px-6 bg-white">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">Stop Making Boring Worksheets.</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
                Turn any text into an unforgettable lesson in 60 seconds.
            </p>
             <h2 className="mt-2 text-2xl font-bold text-indigo-600">⚡ A spark in the silence ⚡</h2>
        </section>
    );

    return (
        <LandingPageLayout 
            heroContent={heroContent} 
            footerContent={<ReviewLinks />} 
            onStartAuth={onStartAuth} 
            pageType="landing"
        />
    );
});