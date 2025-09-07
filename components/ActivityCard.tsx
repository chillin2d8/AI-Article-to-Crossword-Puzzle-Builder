import React from 'react';
import type { Timestamp } from '@firebase/firestore';

interface Activity {
    id: string;
    title: string;
    createdAt: Timestamp;
}

interface ActivityCardProps {
    activity: Activity;
    onView: () => void;
    onDelete: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = React.memo(({ activity, onView, onDelete }) => {
    const formattedDate = activity.createdAt?.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <h4 className="font-semibold text-slate-800">{activity.title}</h4>
                <p className="text-sm text-slate-500">Created on {formattedDate}</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onView}
                    className="px-4 py-1.5 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50"
                >
                    View
                </button>
                 <button
                    onClick={onDelete}
                    className="px-4 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-full hover:bg-red-50"
                >
                    Delete
                </button>
            </div>
        </div>
    );
});