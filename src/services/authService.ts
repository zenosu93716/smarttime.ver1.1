import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../firebase';
import { logAuth, logError } from './logService';
import { createUserProfile, getUserProfile, User } from './dbService';

export const registerUser = async (email: string, password: string, name: string, role: User['role'], department: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await createUserProfile({
      uid: user.uid,
      email: user.email!,
      name,
      role,
      department,
    });
    
    await logAuth(email, 'SUCCESS');
    return user;
  } catch (error: any) {
    await logAuth(email, 'FAIL');
    await logError(error.message, 'registerUser');
    throw new Error(error.message || '회원가입에 실패했습니다.');
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await logAuth(email, 'SUCCESS');
    return userCredential.user;
  } catch (error: any) {
    await logAuth(email, 'FAIL');
    await logError(error.message, 'loginUser');
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    await logError(error.message, 'logoutUser');
    throw new Error('로그아웃에 실패했습니다.');
  }
};

export const subscribeToAuthChanges = (callback: (user: any | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
