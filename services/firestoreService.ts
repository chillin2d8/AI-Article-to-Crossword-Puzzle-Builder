import { 
    doc,
    getDoc,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    deleteDoc,
    type Timestamp,
} from "@firebase/firestore";
import { db, isFirebaseConfigured } from '../firebaseConfig';
import type { GeneratedData, SubscriptionInfo } from '../types';
import { USER_TIERS } from '../config';

// Define the shape of the activity data we'll show on the dashboard.
export interface Activity {
  id: string;
  title: string;
  createdAt: Timestamp;
}

// --- SIMULATION MODE ---
const simulatedActivities: { [id: string]: GeneratedData } = {};
const createSimulatedActivity = (data: GeneratedData): GeneratedData => ({
    ...data,
    createdAt: {
        toDate: () => new Date(),
        seconds: Date.now() / 1000,
    }
});

if (!isFirebaseConfigured) {
    const now = new Date();
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 5);
    // FIX: Removed obsolete properties from `analysisData` to match `ComprehensiveAnalysisData` type.
    simulatedActivities['sim1'] = createSimulatedActivity({ title: 'Simulated Past Activity', summary: 'This is an old activity from 5 months ago.', gradeLevel: '6', puzzleType: 'crossword', analysisData: { title: 'Simulated Past Activity', summary: 'This is an old activity from 5 months ago.', search_query: 'history', enriched_vocabulary: [], word_search_vocabulary: [], word_scramble_vocabulary: [], error: null, reason: null }, gridData: { grid: [], placedWords: [], rows: 0, cols: 0 }, wordSearchData: { grid: [], placedWords: [], wordList: [] }, wordScrambleData: { wordList: [] }, imageUrlOne: '', imageUrlTwo: '', searchQuery: 'history', createdAt: pastDate });
    // FIX: Removed obsolete properties from `analysisData` to match `ComprehensiveAnalysisData` type.
    simulatedActivities['sim2'] = createSimulatedActivity({ title: 'Simulated Recent Activity', summary: 'This is a recent activity.', gradeLevel: '6', puzzleType: 'crossword', analysisData: { title: 'Simulated Recent Activity', summary: 'This is a recent activity.', search_query: 'recent', enriched_vocabulary: [], word_search_vocabulary: [], word_scramble_vocabulary: [], error: null, reason: null }, gridData: { grid: [], placedWords: [], rows: 0, cols: 0 }, wordSearchData: { grid: [], placedWords: [], wordList: [] }, wordScrambleData: { wordList: [] }, imageUrlOne: '', imageUrlTwo: '', searchQuery: 'recent', createdAt: now });
}

// --- END SIMULATION MODE ---

export const fetchUserActivities = async (userId: string): Promise<Activity[]> => {
     if (!isFirebaseConfigured || !db) {
        return Object.entries(simulatedActivities).map(([id, data]) => ({
            id,
            title: data.title,
            createdAt: data.createdAt as unknown as Timestamp,
        })).sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    }
    
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const q = query(activitiesRef, orderBy('createdAt', 'desc'), limit(50));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        createdAt: doc.data().createdAt,
    }));
};

export const fetchSingleActivity = async (userId: string, activityId: string): Promise<GeneratedData | null> => {
    if (!isFirebaseConfigured || !db) {
        // Add the created activity to the simulation for immediate fetching if needed
        if (activityId.startsWith('sim_')) {
            const newActivityData = (window as any)._tempSimulatedActivity;
            if (newActivityData) {
                simulatedActivities[activityId] = createSimulatedActivity(newActivityData);
                delete (window as any)._tempSimulatedActivity;
            }
        }
        return simulatedActivities[activityId] || null;
    }

    const activityRef = doc(db, 'users', userId, 'activities', activityId);
    const docSnap = await getDoc(activityRef);

    if (docSnap.exists()) {
        return docSnap.data() as GeneratedData;
    } else {
        return null;
    }
};

export const deleteUserActivity = async (userId: string, activityId: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) {
        delete simulatedActivities[activityId];
        return;
    }
    const activityRef = doc(db, 'users', userId, 'activities', activityId);
    await deleteDoc(activityRef);
};


export const getSubscriptionInfo = async (userId: string): Promise<SubscriptionInfo | null> => {
    if (!isFirebaseConfigured || !db) {
        // Return a simulated subscription for a 'monthly' user in dev mode
        if (userId.includes('monthly@test.com')) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 15);
            return {
                role: 'Monthly Subscriber',
                status: 'active',
                cancel_at_period_end: false,
                current_period_end: endDate,
            };
        }
        return null;
    }

    // Path determined by the Stripe Firebase Extension
    const subscriptionsRef = collection(db, 'customers', userId, 'subscriptions');
    const q = query(subscriptionsRef, orderBy('created', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    const subData = querySnapshot.docs[0].data();
    const productName = subData.items[0]?.price?.product?.name || 'Unknown Plan';

    // Find the tier config that matches the product name from Stripe
    const tierKey = Object.keys(USER_TIERS).find(key => 
        (USER_TIERS[key as keyof typeof USER_TIERS] as any).name === productName
    );
    const tierName = tierKey || productName;

    return {
        role: tierName,
        status: subData.status,
        cancel_at_period_end: subData.cancel_at_period_end,
        current_period_end: new Date(subData.current_period_end.seconds * 1000),
    };
};