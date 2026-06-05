import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check
if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LdB2gMtAAAAABeXLRGLr0QFRJ9ntIolULcDpGLx'),
    isTokenAutoRefreshEnabled: true
  });
}

// Suppress Firestore default console errors about offline mode
setLogLevel('silent');

export const db = initializeFirestore(app, { 
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
  experimentalForceLongPolling: true 
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  
  // Silently handle offline/cache errors to prevent console spam
  if (errMsg.includes('the client is offline') || 
      errMsg.includes('Could not reach Cloud Firestore backend') ||
      errMsg.includes('Failed to get document from server')) {
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  // Just log it instead of throwing to prevent app crashes on snapshot listeners
  console.warn('Firestore Operation Failed (Handled):', errInfo.error);

  // Show a UI toast notification
  if (typeof document !== 'undefined') {
    try {
      const toast = document.createElement('div');
      toast.textContent = `Database Error (Handled): ${errMsg}`;
      toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg z-[9999] opacity-0 transition-opacity duration-300 pointer-events-none text-sm max-w-[90vw] text-center';
      document.body.appendChild(toast);
      
      // Trigger fade in
      setTimeout(() => { toast.classList.remove('opacity-0'); }, 10);
      
      // Trigger fade out and remove
      setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 4500);
    } catch(e) {
      console.warn("UI Toast failed to show", e);
    }
  }
}
