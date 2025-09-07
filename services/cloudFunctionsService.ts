import { httpsCallable } from "@firebase/functions";
import { functions, isFirebaseConfigured } from '../firebaseConfig';
import type { GeneratedData } from '../types';

// --- SIMULATION MODE FOR DEVELOPMENT ---
const simulatedCreateActivity = async (data: GeneratedData): Promise<{ data: { activityId: string } }> => {
    console.log('[SIMULATED] createActivity called with data:', data);

    // Simulate content moderation failure for testing purposes
    if (data.summary.toLowerCase().includes('inappropriate-test-word')) {
        console.log('[SIMULATED] Moderation failed.');
        // This is how Firebase Functions surfaces specific errors to the client.
        const error: any = new Error("This content violates our community guidelines and cannot be saved.");
        error.code = 'permission-denied';
        throw error;
    }

    const activityId = `sim_${Date.now()}`;
    // In a real scenario, the backend saves this. In simulation, we need a way
    // for fetchSingleActivity to find this new data if the user clicks "View".
    // We'll attach it to the window object temporarily.
    (window as any)._tempSimulatedActivity = data;
    
    console.log(`[SIMULATED] Activity created with ID: ${activityId}`);
    return Promise.resolve({ data: { activityId } });
};
// --- END SIMULATION MODE ---


/**
 * Calls the `createActivity` Cloud Function to securely save new activity data.
 * This function performs content moderation on the backend before saving to Firestore.
 * @param data The complete `GeneratedData` object for the new activity.
 * @returns The result from the Cloud Function, typically including the new activity's ID.
 */
export const createActivity = async (data: GeneratedData) => {
    if (!isFirebaseConfigured) {
        return simulatedCreateActivity(data);
    }
    
    if (!functions) {
        throw new Error("Firebase Functions is not initialized.");
    }
    
    const createActivityCallable = httpsCallable(functions, 'createActivity');

    try {
        const result = await createActivityCallable(data);
        return result;
    } catch (error) {
        console.error("Error calling createActivity function:", error);
        // Re-throw the error so the calling UI can handle it, preserving the error code.
        throw error;
    }
};
