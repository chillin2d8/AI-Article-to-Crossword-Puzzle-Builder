import React, { useState, useEffect } from 'react';
import type { User } from '@firebase/auth';
import type { UserTier, GeneratedData } from '../types';
import * as firestoreService from '../services/firestoreService';
import { ActivityCard } from './ActivityCard';
import type { Timestamp } from '@firebase/firestore';

interface Activity extends firestoreService.Activity {}

interface DashboardProps {
    user: User;
    tier: UserTier;
    onStartNew: () => void;
    onViewHistory: (data: GeneratedData) => void;
    onUpgrade: () => void;
}

export const Dashboard: React.FC<DashboardProps> = React.memo(({ user, tier, onStartNew, onViewHistory, onUpgrade }) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const displayName = user.displayName || user.email?.split('@')[0];
    const hasLimitedHistory = tier === 'Free' || tier === 'Monthly';

    useEffect(() => {
        const loadActivities = async () => {
            try {
                const userActivities = await firestoreService.fetchUserActivities(user.uid);
                setActivities(userActivities);
            } catch (err) {
                console.error("Failed to fetch activities:", err);
                setError("Could not load your past activities. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        loadActivities();
    }, [user.uid]);
    
    const handleDelete = async (activityId: string) => {
        if (!window.confirm("Are you sure you want to delete this activity? This cannot be undone.")) {
            return;
        }
        try {
            await firestoreService.deleteUserActivity(user.uid, activityId);
            setActivities(prev => prev.filter(act => act.id !== activityId));
        } catch (err) {
            console.error("Failed to delete activity:", err);
            alert("Could not delete the activity. Please try again.");
        }
    };
    
    const handleView = async (activityId: string) => {
        try {
            const fullActivityData = await firestoreService.fetchSingleActivity(user.uid, activityId);
            if (fullActivityData) {
                onViewHistory(fullActivityData);
            } else {
                throw new Error("Activity data not found.");
            }
        } catch (err) {
            console.error("Failed to fetch full activity:", err);
            alert("Could not load the selected activity. It may have been deleted.");
        }
    };

    // --- Retention Policy Logic ---
    const getRetentionDate = () => {
        const now = new Date();
        if (tier === 'Free') {
            now.setMonth(now.getMonth() - 1);
            return now;
        }
        if (tier === 'Monthly') {
            now.setMonth(now.getMonth() - 4);
            return now;
        }
        return null; // For Yearly or other tiers with full history
    };

    const retentionDate = getRetentionDate();
    const displayedActivities = retentionDate
      ? activities.filter(activity => activity.createdAt.toDate() >= retentionDate)
      : activities;
      
    const retentionPeriodText = tier === 'Free' ? '1 month' : '4 months';

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Welcome, {displayName}!</h2>
                    <p className="text-slate-600 mt-1">Ready to create a spark? Start a new activity or revisit a past one.</p>
                </div>
                <button
                    onClick={onStartNew}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 ease-in-out self-start sm:self-center"
                >
                   + New Activity
                </button>
            </div>
            
            <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">My Activities</h3>
                
                {hasLimitedHistory && (
                  <div className="text-sm text-center text-slate-600 bg-slate-100 p-3 rounded-md border border-slate-200 mb-6">
                    Your plan's visible activity history is limited to the last {retentionPeriodText}. 
                    <button onClick={onUpgrade} className="font-semibold text-indigo-600 hover:underline ml-1">Upgrade to Yearly</button> to keep your full history.
                  </div>
                )}
                
                {isLoading && <p>Loading activities...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {!isLoading && displayedActivities.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-lg">
                        <p className="text-slate-600">You haven't created any activities yet.</p>
                        <button onClick={onStartNew} className="mt-4 text-indigo-600 font-semibold hover:underline">
                            Create your first one!
                        </button>
                    </div>
                )}
                
                {!isLoading && displayedActivities.length > 0 && (
                    <div className="space-y-3">
                       {displayedActivities.map(activity => (
                           <ActivityCard 
                                key={activity.id} 
                                activity={activity} 
                                onView={() => handleView(activity.id)}
                                onDelete={() => handleDelete(activity.id)}
                            />
                       ))}
                    </div>
                )}
            </div>
        </div>
    );
});