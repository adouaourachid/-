/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase Firestore & Auth integration for cross-device puzzle progress sync.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  getDocFromServer,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Standard Firestore Error Handling
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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on initialization
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is unreachable.');
    }
    return false;
  }
}
testConnection();

// Authentication helpers
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google sign-in error:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out error:', err);
    throw err;
  }
}

export function onUserAuthStateChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Data synchronization structures
export interface CloudPuzzleProgress {
  userId: string;
  puzzleId: string;
  gridData: string; // JSON matrix
  timerSeconds: number;
  hintsUsedCount: number;
  isCompleted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// Save puzzle progress to Firestore
export async function savePuzzleProgressToFirestore(
  userId: string,
  puzzleId: string,
  data: {
    grid: string[][];
    timerSeconds: number;
    hintsUsedCount: number;
    isCompleted: boolean;
  }
): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/puzzles/${puzzleId}`;

  try {
    const docRef = doc(db, 'users', userId, 'puzzles', puzzleId);
    const serializedGrid = JSON.stringify(data.grid);

    await setDoc(
      docRef,
      {
        userId,
        puzzleId,
        gridData: serializedGrid,
        timerSeconds: data.timerSeconds,
        hintsUsedCount: data.hintsUsedCount,
        isCompleted: data.isCompleted,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load puzzle progress once from Firestore
export async function loadPuzzleProgressFromFirestore(
  userId: string,
  puzzleId: string
): Promise<{
  grid: string[][];
  timerSeconds: number;
  hintsUsedCount: number;
  isCompleted: boolean;
} | null> {
  if (!userId) return null;
  const path = `users/${userId}/puzzles/${puzzleId}`;

  try {
    const docRef = doc(db, 'users', userId, 'puzzles', puzzleId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as CloudPuzzleProgress;
      let parsedGrid: string[][] = [];
      try {
        parsedGrid = JSON.parse(data.gridData);
      } catch {
        parsedGrid = [];
      }
      return {
        grid: parsedGrid,
        timerSeconds: data.timerSeconds || 0,
        hintsUsedCount: data.hintsUsedCount || 0,
        isCompleted: data.isCompleted || false,
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Subscribe to live puzzle updates from another device
export function subscribeToPuzzleProgress(
  userId: string,
  puzzleId: string,
  onUpdate: (data: {
    grid: string[][];
    timerSeconds: number;
    hintsUsedCount: number;
    isCompleted: boolean;
  }) => void
) {
  if (!userId) return () => {};
  const path = `users/${userId}/puzzles/${puzzleId}`;

  const docRef = doc(db, 'users', userId, 'puzzles', puzzleId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as CloudPuzzleProgress;
        try {
          const parsedGrid = JSON.parse(data.gridData);
          onUpdate({
            grid: parsedGrid,
            timerSeconds: data.timerSeconds || 0,
            hintsUsedCount: data.hintsUsedCount || 0,
            isCompleted: data.isCompleted || false,
          });
        } catch (err) {
          console.warn('Failed to parse grid data from cloud snapshot', err);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Save User Overall Achievements & Stats to Firestore
export async function saveUserAchievementsToFirestore(
  userId: string,
  stats: {
    totalSolved: number;
    moroccanSolved: number;
    scienceSolved: number;
    specialSolved: number;
    totalTimeSpentSeconds: number;
    averageTimeSeconds: number;
    bestTimeSeconds: number | null;
    totalHintsUsed: number;
    zeroHintCount: number;
    unlockedBadgeIds: string[];
    solvedPuzzles: Record<string, unknown>;
  }
): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/stats/achievements`;

  try {
    const docRef = doc(db, 'users', userId, 'stats', 'achievements');
    const solvedHistoryJson = JSON.stringify(stats.solvedPuzzles || {});

    await setDoc(
      docRef,
      {
        userId,
        totalSolved: stats.totalSolved,
        moroccanSolved: stats.moroccanSolved,
        scienceSolved: stats.scienceSolved,
        specialSolved: stats.specialSolved,
        totalTimeSpentSeconds: stats.totalTimeSpentSeconds,
        averageTimeSeconds: stats.averageTimeSeconds,
        bestTimeSeconds: stats.bestTimeSeconds,
        totalHintsUsed: stats.totalHintsUsed,
        zeroHintCount: stats.zeroHintCount,
        unlockedBadgeIds: stats.unlockedBadgeIds,
        solvedHistoryJson,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load User Achievements & Stats from Firestore
export async function loadUserAchievementsFromFirestore(
  userId: string
): Promise<{
  totalSolved: number;
  moroccanSolved: number;
  scienceSolved: number;
  specialSolved: number;
  totalTimeSpentSeconds: number;
  averageTimeSeconds: number;
  bestTimeSeconds: number | null;
  totalHintsUsed: number;
  zeroHintCount: number;
  unlockedBadgeIds: string[];
  solvedPuzzles: Record<string, any>;
} | null> {
  if (!userId) return null;
  const path = `users/${userId}/stats/achievements`;

  try {
    const docRef = doc(db, 'users', userId, 'stats', 'achievements');
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      let parsedHistory = {};
      try {
        parsedHistory = JSON.parse(data.solvedHistoryJson || '{}');
      } catch {
        parsedHistory = {};
      }

      return {
        totalSolved: data.totalSolved || 0,
        moroccanSolved: data.moroccanSolved || 0,
        scienceSolved: data.scienceSolved || 0,
        specialSolved: data.specialSolved || 0,
        totalTimeSpentSeconds: data.totalTimeSpentSeconds || 0,
        averageTimeSeconds: data.averageTimeSeconds || 0,
        bestTimeSeconds: data.bestTimeSeconds !== undefined ? data.bestTimeSeconds : null,
        totalHintsUsed: data.totalHintsUsed || 0,
        zeroHintCount: data.zeroHintCount || 0,
        unlockedBadgeIds: Array.isArray(data.unlockedBadgeIds) ? data.unlockedBadgeIds : [],
        solvedPuzzles: parsedHistory,
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ==========================================
// Genuine Real Visitor Counter (عداد زوار حقيقي يبدأ من الصفر)
// ==========================================
const COUNTER_DOC_ID = 'real_visitors';

export async function incrementVisitorCount(): Promise<number> {
  const docRef = doc(db, 'counters', COUNTER_DOC_ID);

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        count: 1,
        updatedAt: serverTimestamp(),
      });
      localStorage.setItem('abu_salma_real_visitors_local', '1');
      return 1;
    } else {
      await updateDoc(docRef, {
        count: increment(1),
        updatedAt: serverTimestamp(),
      });
      const updatedSnap = await getDoc(docRef);
      const nextCount = (updatedSnap.data()?.count as number) || 1;
      localStorage.setItem('abu_salma_real_visitors_local', String(nextCount));
      return nextCount;
    }
  } catch (err) {
    console.warn('Could not increment visitor counter in Firestore:', err);
    const local = parseInt(localStorage.getItem('abu_salma_real_visitors_local') || '0', 10);
    const next = local + 1;
    localStorage.setItem('abu_salma_real_visitors_local', String(next));
    return next;
  }
}

export function subscribeToVisitorCount(callback: (count: number) => void) {
  const docRef = doc(db, 'counters', COUNTER_DOC_ID);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const count = snapshot.data()?.count;
        if (typeof count === 'number') {
          callback(count);
          localStorage.setItem('abu_salma_real_visitors_local', String(count));
          return;
        }
      }
      const local = parseInt(localStorage.getItem('abu_salma_real_visitors_local') || '0', 10);
      callback(local);
    },
    (error) => {
      console.warn('Could not subscribe to visitor count:', error);
      const local = parseInt(localStorage.getItem('abu_salma_real_visitors_local') || '0', 10);
      callback(local);
    }
  );
}


