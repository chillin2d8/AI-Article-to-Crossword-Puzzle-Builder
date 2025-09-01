
// FIX: Updated Firebase auth import to use the @firebase scoped package to resolve module export errors.
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    type User
} from "@firebase/auth";
import { auth, isFirebaseConfigured } from '../firebaseConfig';
import type { SignInCredentials } from '../types';

// --- SIMULATION MODE FOR DEVELOPMENT ---
// This will be used when Firebase is not configured.

let simulatedUser: User | null = null;
const listeners: ((user: User | null) => void)[] = [];

const notifyListeners = () => {
    listeners.forEach(callback => callback(simulatedUser));
};

const mockUser = (email: string): User => ({
    uid: `simulated-${Date.now()}`,
    email,
    emailVerified: true,
    isAnonymous: false,
    providerData: [],
    metadata: {},
    displayName: email.split('@')[0],
    photoURL: null,
    phoneNumber: null,
    providerId: 'password',
    tenantId: null,
    refreshToken: 'mock-token',
    delete: async () => {},
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
});

const simulatedSignIn = async ({ email, password }: SignInCredentials): Promise<User> => {
    // Check against hardcoded credentials
    const validUsers = {
        'admin@play-app.app': 'admin',
        'monthly@test.com': 'password',
        'free@test.com': 'password',
    };

    if (validUsers[email as keyof typeof validUsers] === password) {
        simulatedUser = mockUser(email);
        notifyListeners();
        return simulatedUser;
    }

    throw new Error("Simulated Auth: Invalid credentials.");
};

const simulatedLogOut = (): Promise<void> => {
    simulatedUser = null;
    notifyListeners();
    return Promise.resolve();
};

const simulatedOnAuthChange = (callback: (user: User | null) => void) => {
    listeners.push(callback);
    // Immediately invoke with current state
    callback(simulatedUser);
    // Return an unsubscribe function
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
};
// --- END SIMULATION MODE ---


export const signIn = async ({ email, password }: SignInCredentials): Promise<User> => {
    if (!isFirebaseConfigured || !auth) {
        return simulatedSignIn({ email, password });
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const logOut = (): Promise<void> => {
    if (!isFirebaseConfigured || !auth) {
        return simulatedLogOut();
    }
    return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    if (!isFirebaseConfigured || !auth) {
        return simulatedOnAuthChange(callback);
    }
    return onAuthStateChanged(auth, callback);
};