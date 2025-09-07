

import React from 'react';
import { LandingPageLayout } from './LandingPageLayout';

interface LandingPageProps {
  onStartAuth: () => void;
}

export const ElementarySchoolPage: React.FC<LandingPageProps> = React.memo(({ onStartAuth }) => {
    const heroContent = (
        <section className="text-center py-20 px-6 bg-white">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">The 5-Minute Lesson Plan Upgrade Your Students Will Beg For.</h1>
            <h3 className="mt-4 text-2xl font-bold text-indigo-600">⚡ Transform Learning in Your Classroom! ⚡</h3>
            <div className="mt-8 max-w-2xl mx-auto text-left space-y-4 text-slate-700">
                <p>
                    Your planning period is sacred, yet it's filled with the endless search for resources that are engaging, standards-aligned, <strong>and</strong> work for every student. The moment a lesson falls flat is frustrating. The disengaged chatter, the vacant stares—it's a sign that the material isn't connecting.
                </p>
                <p className="font-semibold text-slate-800 text-lg">
                   PLAY is your secret weapon for engagement and differentiation.
                </p>
            </div>
            <p className="mt-8 text-slate-800 text-center max-w-2xl mx-auto">
                For the price of a single book, you can provide tailored puzzles for your classroom all year round.
            </p>
            <div className="mt-10">
                <button onClick={onStartAuth} className="mx-auto block px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 text-lg">
                    Reclaim Your Planning Period - Generate Your First Activity Free!
                </button>
            </div>
        </section>
    );

    return (
        <LandingPageLayout heroContent={heroContent} onStartAuth={onStartAuth} pageType="landing" />
    );
});