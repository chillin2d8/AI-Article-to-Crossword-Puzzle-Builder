
import React from 'react';
import { LandingPageLayout } from './LandingPageLayout';

interface LandingPageProps {
  onStartAuth: () => void;
}

export const HomeschoolPage: React.FC<LandingPageProps> = ({ onStartAuth }) => {
  const heroContent = (
    <section className="text-center py-20 px-6 bg-white">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">From Kitchen Table to Grand Adventure.</h1>
         <h2 className="mt-4 max-w-3xl mx-auto text-lg text-slate-600">
            Make Homeschooling Unforgettable.
        </h2>
         <h3 className="mt-4 text-2xl font-bold text-indigo-600">⚡ A Spark in the Silence ⚡</h3>
         <div className="mt-8 max-w-2xl mx-auto text-left space-y-4 text-slate-700">
            <p>
                Are you juggling the roles of teacher, curriculum planner, and parent, constantly searching for that <strong>one</strong> resource that will make a lesson click? The pressure to create fresh, engaging material every single day is immense.
            </p>
            <p className="font-semibold text-slate-800 text-lg">
                PLAY is your new creative partner.
            </p>
             <p className="mt-8 text-slate-800 text-center max-w-2xl mx-auto">
            For less than the price of a single curriculum book, you can provide a year's worth of custom, engaging activities tailored perfectly to your child.
        </p>
         <div className="mt-10">
            <button onClick={onStartAuth} className="mx-auto block px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 text-lg">
                Start Your Homeschooling Adventure - Create a Lesson Free!
            </button>
        </div>
        </div>
    </section>
  );

  return (
    <LandingPageLayout heroContent={heroContent} onStartAuth={onStartAuth} pageType="landing" />
  );
};