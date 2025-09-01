import { httpsCallable } from "firebase/functions";
import { auth, functions, isFirebaseConfigured } from '../firebaseConfig';

if (!isFirebaseConfigured || !functions) {
    console.log("Firebase not configured, subscription service is disabled.");
}

/**
 * Creates a Stripe checkout session and redirects the user to the checkout page.
 * This function is called when a user selects a new subscription plan.
 * It interacts with a Cloud Function created by the 'firestore-stripe-payments' extension.
 * @param priceId The ID of the Stripe price to subscribe to.
 */
export const createCheckoutSession = async (priceId: string): Promise<void> => {
    if (!functions || !auth?.currentUser) {
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
    }
};

/**
 * Redirects the user to the Stripe Customer Portal to manage their subscription.
 * This allows users to update payment methods, view invoices, or cancel their plan.
 * It interacts with a Cloud Function created by the 'firestore-stripe-payments' extension.
 */
export const goToCustomerPortal = async (): Promise<void> => {
    if (!functions || !auth?.currentUser) {
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
    }
};