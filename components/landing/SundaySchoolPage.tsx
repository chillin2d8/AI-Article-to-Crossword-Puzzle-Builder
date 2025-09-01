
import React from 'react';
import { LandingPageLayout } from './LandingPageLayout';

interface LandingPageProps {
  onStartAuth: () => void;
}

export const SundaySchoolPage: React.FC<LandingPageProps> = ({ onStartAuth }) => {
  const heroContent = (
    <section className="text-center py-20 px-6 bg-white">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">Don't Just Teach the Story. Let Them Live It.</h1>
         <h3 className="mt-4 text-2xl font-bold text-indigo-600">⚡ Ignite Faith and Fun with PLAY! ⚡</h3>
         <div className="mt-8 max-w-2xl mx-auto text-left space-y-4 text-slate-700">
            <p>
                Dear Sunday School Teacher, you have the most important stories in the world to share, but only a short window each week to make them resonate. How do you ensure the story of David and Goliath feels more epic than a video game?
            </p>
            <p className="font-semibold text-slate-800 text-lg">
               PLAY helps you turn timeless lessons into unforgettable experiences.
            </p>
             <p className="mt-8 text-slate-800 text-center max-w-2xl mx-auto">
            For less than the price of a single resource book, you can provide a year's worth of custom, faith-based activities that will captivate your students.
        </p>
         <div className="mt-10">
            <button onClick={onStartAuth} className="mx-auto block px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 text-lg">
                Prepare Your Next Sunday School Lesson in Minutes - Try PLAY Today!
            </button>
        </div>
        </div>
    </section>
  );

  return (
    <LandingPageLayout heroContent={heroContent} onStartAuth={onStartAuth} pageType="landing" />
  );
};