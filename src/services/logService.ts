import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const logAuth = async (email: string, status: 'SUCCESS' | 'FAIL') => {
  try {
    await addDoc(collection(db, 'auth_logs'), {
      email,
      status,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
};

export const logError = async (errorMessage: string, context?: string, userId?: string) => {
  try {
    await addDoc(collection(db, 'error_logs'), {
      errorMessage,
      context: context || '',
      userId: userId || '',
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log error event:', error);
  }
};
