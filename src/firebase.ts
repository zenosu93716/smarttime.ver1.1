import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 서비스 종료로 인한 더미 설정
const firebaseConfig = {
  apiKey: "discontinued",
  authDomain: "discontinued.firebaseapp.com",
  projectId: "discontinued",
  storageBucket: "discontinued.appspot.com",
  messagingSenderId: "000000000000",
  appId: "0:000000000000:web:0000000000000000000000"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
