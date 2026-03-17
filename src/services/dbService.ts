import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { logError } from './logService';
import DOMPurify from 'dompurify';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: '일반직원' | '팀장' | '부팀장' | '사례관리사' | '파트장';
  department?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Schedule {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  fileUrl?: string;
  createdAt: any;
  updatedAt: any;
}

const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error: any) {
    await logError(error.message, 'getUserProfile', uid);
    throw new Error('사용자 정보를 불러오는데 실패했습니다.');
  }
};

export const createUserProfile = async (user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
      email: sanitizeInput(user.email),
      name: sanitizeInput(user.name),
      role: user.role,
      department: user.department ? sanitizeInput(user.department) : '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    await logError(error.message, 'createUserProfile', user.uid);
    throw new Error('사용자 프로필 생성에 실패했습니다.');
  }
};

export const getSchedules = async (userId: string, role: string): Promise<Schedule[]> => {
  try {
    const schedulesRef = collection(db, 'schedules');
    let q;

    if (['팀장', '부팀장', '사례관리사', '파트장'].includes(role)) {
      q = query(schedulesRef, orderBy('date', 'asc'));
    } else {
      q = query(schedulesRef, where('userId', '==', userId), orderBy('date', 'asc'));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));
  } catch (error: any) {
    await logError(error.message, 'getSchedules', userId);
    throw new Error('일정 목록을 불러오는데 실패했습니다.');
  }
};

export const createSchedule = async (schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = doc(collection(db, 'schedules'));
    await setDoc(docRef, {
      userId: schedule.userId,
      userName: sanitizeInput(schedule.userName),
      title: sanitizeInput(schedule.title),
      description: schedule.description ? sanitizeInput(schedule.description) : '',
      date: sanitizeInput(schedule.date),
      fileUrl: schedule.fileUrl || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    await logError(error.message, 'createSchedule', schedule.userId);
    throw new Error('일정 등록에 실패했습니다.');
  }
};

export const updateSchedule = async (id: string, updates: Partial<Omit<Schedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'schedules', id);
    const sanitizedUpdates: any = { updatedAt: serverTimestamp() };
    
    if (updates.title) sanitizedUpdates.title = sanitizeInput(updates.title);
    if (updates.description !== undefined) sanitizedUpdates.description = sanitizeInput(updates.description);
    if (updates.date) sanitizedUpdates.date = sanitizeInput(updates.date);
    if (updates.fileUrl !== undefined) sanitizedUpdates.fileUrl = updates.fileUrl;

    await updateDoc(docRef, sanitizedUpdates);
  } catch (error: any) {
    await logError(error.message, 'updateSchedule', userId);
    throw new Error('일정 수정에 실패했습니다.');
  }
};

export const deleteSchedule = async (id: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'schedules', id);
    await deleteDoc(docRef);
  } catch (error: any) {
    await logError(error.message, 'deleteSchedule', userId);
    throw new Error('일정 삭제에 실패했습니다.');
  }
};
