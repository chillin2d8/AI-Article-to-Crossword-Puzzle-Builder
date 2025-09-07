// FIX: Updated Firebase auth import to use the @firebase scoped package to resolve module export errors.
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile,
    updateEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    type User
} from "@firebase/auth";
import { auth, isFirebaseConfigured } from '../firebaseConfig';
import type { SignInCredentials, SignUpCredentials } from '../types';

// --- SIMULATION MODE FOR DEVELOPMENT ---
// This will be used when Firebase is not configured.

let simulatedUser: User | null = null;
const listeners: ((user: User | null) => void)[] = [];

// In-memory store for simulated users
const validUsers: { [email: string]: string } = {
    'admin@play-app.app': 'admin',
    'monthly@test.com': 'password',
    'free@test.com': 'password',
};
const userProfiles: { [email: string]: { displayName: string } } = {
    'admin@play-app.app': { displayName: 'Admin User' },
    'monthly@test.com': { displayName: 'Monthly User' },
    'free@test.com': { displayName: 'Free User' },
};


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
    displayName: userProfiles[email]?.displayName || email.split('@')[0],
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
    if (validUsers[email] === password) {
        simulatedUser = mockUser(email);
        notifyListeners();
        return simulatedUser;
    }
    throw new Error("Simulated Auth: Invalid credentials.");
};

const simulatedSignUp = async ({ email, password, fullName }: SignUpCredentials): Promise<User> => {
    if (validUsers[email]) {
        throw new Error("Simulated Auth: Email already in use.");
    }
    validUsers[email] = password;
    userProfiles[email] = { displayName: fullName };
    simulatedUser = mockUser(email);
    notifyListeners();
    return simulatedUser;
};

const simulatedLogOut = (): Promise<void> => {
    simulatedUser = null;
    notifyListeners();
    return Promise.resolve();
};

const simulatedOnAuthChange = (callback: (user: User | null) => void) => {
    listeners.push(callback);
    callback(simulatedUser);
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
};

const simulatedReauthenticate = async (password: string): Promise<void> => {
    if (!simulatedUser?.email || validUsers[simulatedUser.email] !== password) {
        throw new Error("Simulated Auth: Incorrect password.");
    }
    return Promise.resolve();
};

const simulatedUpdateEmail = async (newEmail: string): Promise<void> => {
    if (!simulatedUser?.email) {
        throw new Error("Simulated Auth: No user is signed in.");
    }
    if (validUsers[newEmail]) {
        throw new Error("Simulated Auth: Email already in use by another account.");
    }
    const oldEmail = simulatedUser.email;
    const password = validUsers[oldEmail];
    const profile = userProfiles[oldEmail];
    
    delete validUsers[oldEmail];
    delete userProfiles[oldEmail];
    
    validUsers[newEmail] = password;
    userProfiles[newEmail] = profile;
    
    simulatedUser = mockUser(newEmail);
    notifyListeners();
};
// --- END SIMULATION MODE ---


export const signIn = async ({ email, password }: SignInCredentials): Promise<User> => {
    if (!isFirebaseConfigured || !auth) {
        return simulatedSignIn({ email, password });
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const signUp = async ({ email, password, fullName }: SignUpCredentials): Promise<User> => {
    if (!isFirebaseConfigured || !auth) {
        return simulatedSignUp({ email, password, fullName });
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
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

export const reauthenticateUser = async (password: string): Promise<void> => {
    if (!isFirebaseConfigured || !auth?.currentUser) {
        return simulatedReauthenticate(password);
    }
    const user = auth.currentUser;
    if (!user.email) {
        throw new Error("User does not have an email address for re-authentication.");
    }
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
};

export const updateUserEmail = async (newEmail: string): Promise<void> => {
    if (!isFirebaseConfigured || !auth?.currentUser) {
        return simulatedUpdateEmail(newEmail);
    }
    await updateEmail(auth.currentUser, newEmail);
};