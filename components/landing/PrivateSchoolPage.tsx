
import React from 'react';
import { LandingPageLayout } from './LandingPageLayout';

interface LandingPageProps {
  onStartAuth: () => void;
}

export const PrivateSchoolPage: React.FC<LandingPageProps> = ({ onStartAuth }) => {
    const heroContent = (
        <section className="text-center py-20 px-6 bg-white">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">Elevate Your Curriculum. Inspire Deeper Learning.</h1>
            <h3 className="mt-4 text-2xl font-bold text-indigo-600">⚡ A Spark in the Silence ⚡</h3>
            <div className="mt-8 max-w-2xl mx-auto text-left space-y-4 text-slate-700">
                <p>
                   As a private school educator, you're committed to a higher standard and a unique curriculum. Finding resources that are both engaging and perfectly aligned with your specific educational philosophy can be a constant challenge.
                </p>
                <p className="font-semibold text-slate-800 text-lg">
                    PLAY is the flexible tool that respects your unique approach.
                </p>
            </div>
            <p className="mt-8 text-slate-800 text-center max-w-2xl mx-auto">
                For the price of a single book, you can provide tailored puzzles for your classroom all year round, perfectly aligned with your unique curriculum.
            </p>
            <div className="mt-10">
                <button onClick={onStartAuth} className="mx-auto block px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 text-lg">
                    Enhance Your Unique Curriculum - Try PLAY Free!
                </button>
            </div>
        </section>
    );

  return (
    <LandingPageLayout heroContent={heroContent} onStartAuth={onStartAuth} pageType="landing" />
  );
};