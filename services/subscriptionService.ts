import { httpsCallable } from "@firebase/functions";
import { functions, isFirebaseConfigured } from '../firebaseConfig';
import type { User } from '@firebase/auth';

// --- SIMULATION MODE FOR DEVELOPMENT ---
// This will be used when Firebase is not configured. It prevents errors
// and provides feedback to the developer during testing.

const simulatedCreateCheckoutSession = async (priceId: string, user: User): Promise<void> => {
    console.log(`[SIMULATED] createCheckoutSession called for user: ${user.email} with priceId: ${priceId}`);
    alert(`This is a simulated checkout. In a live environment, you would be redirected to Stripe to purchase the plan with ID: ${priceId}`);
    // In a real scenario, this would redirect, so we resolve without doing anything further.
    return Promise.resolve();
};

const simulatedGoToCustomerPortal = async (user: User): Promise<void> => {
    console.log(`[SIMULATED] goToCustomerPortal called for user: ${user.email}`);
    alert('This is a simulated customer portal. In a live environment, you would be redirected to the Stripe Customer Portal to manage your subscription.');
    // In a real scenario, this would redirect, so we resolve without doing anything further.
    return Promise.resolve();
};

// --- END SIMULATION MODE ---


/**
 * Creates a Stripe checkout session and redirects the user to the checkout page.
 * This function is called when a user selects a new subscription plan.
 * It interacts with a Cloud Function created by the 'firestore-stripe-payments' extension.
 * @param priceId The ID of the Stripe price to subscribe to.
 * @param user The authenticated Firebase user object.
 */
export const createCheckoutSession = async (priceId: string, user: User): Promise<void> => {
    // If Firebase isn't configured, use the simulation.
    if (!isFirebaseConfigured) {
        return simulatedCreateCheckoutSession(priceId, user);
    }
    
    if (!functions || !user) {
        // This check remains as a safeguard for the live environment.
        throw new Error("User must be logged in to subscribe.");
    }
    
    // The Cloud Function's name is determined by the Firebase Extension.
    const createCheckoutSessionCallable = httpsCallable(functions, 'ext-firestore-stripe-payments-createCheckoutSession');

    try {
        const result: any = await createCheckoutSessionCallable({
            return_url: window.location.href, // Redirect back to the current page after checkout
            price: priceId,
        });

        // Redirect the user to the secure Stripe-hosted checkout page.
        window.location.assign(result.data.url);
    } catch (error) {
        console.error("Stripe checkout session creation failed:", error);
        alert("Could not initiate the checkout process. Please try again.");
        throw error; // Re-throw to be caught by the UI
    }
};

/**
 * Redirects the user to the Stripe Customer Portal to manage their subscription.
 * This allows users to update payment methods, view invoices, or cancel their plan.
 * It interacts with a Cloud Function created by the 'firestore-stripe-payments' extension.
 * @param user The authenticated Firebase user object.
 */
export const goToCustomerPortal = async (user: User): Promise<void> => {
    // If Firebase isn't configured, use the simulation.
    if (!isFirebaseConfigured) {
        return simulatedGoToCustomerPortal(user);
    }

    if (!functions || !user) {
         // This check remains as a safeguard for the live environment.
        throw new Error("User must be logged in to manage their subscription.");
    }

    // The Cloud Function's name is determined by the Firebase Extension.
    const createPortalLinkCallable = httpsCallable(functions, 'ext-firestore-stripe-payments-createPortalLink');

    try {
        const result: any = await createPortalLinkCallable({
            return_url: window.location.href, // Redirect back here after they're done.
        });

        // Redirect the user to the secure Stripe-hosted customer portal.
        window.location.assign(result.data.url);
    } catch (error) {
        console.error("Stripe customer portal link creation failed:", error);
        alert("Could not open the customer portal. Please try again.");
        throw error; // Re-throw to be caught by the UI
    }
};