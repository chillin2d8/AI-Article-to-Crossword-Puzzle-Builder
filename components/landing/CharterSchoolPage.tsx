
import React from 'react';
import { LandingPageLayout } from './LandingPageLayout';

interface LandingPageProps {
  onStartAuth: () => void;
}

export const CharterSchoolPage: React.FC<LandingPageProps> = ({ onStartAuth }) => {
    const heroContent = (
        <section className="text-center py-20 px-6 bg-white">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">The Innovative Tool for Your Unique Classroom.</h1>
            <h3 className="mt-4 text-2xl font-bold text-indigo-600">⚡ A Spark in the Silence ⚡</h3>
            <div className="mt-8 max-w-2xl mx-auto text-left space-y-4 text-slate-700">
                <p>
                   As a charter school educator, you thrive on innovation and flexibility. Your curriculum is dynamic, student-centered, and often goes beyond the standard textbook. But finding resources that can keep pace with your agile teaching methods is tough.
                </p>
                <p className="font-semibold text-slate-800 text-lg">
                    PLAY is the versatile resource built for an innovative classroom.
                </p>
            </div>
            <p className="mt-8 text-slate-800 text-center max-w-2xl mx-auto">
                For the price of a single book, you can provide tailored puzzles for your classroom all year round, keeping pace with your innovative teaching methods.
            </p>
            <div className="mt-10">
                <button onClick={onStartAuth} className="mx-auto block px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 text-lg">
                    Fuel Your Innovative Classroom - Try PLAY Free!
                </button>
            </div>
        </section>
    );
    
    return (
        <LandingPageLayout heroContent={heroContent} onStartAuth={onStartAuth} pageType="landing" />
    );
};