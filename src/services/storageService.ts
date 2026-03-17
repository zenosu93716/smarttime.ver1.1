import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { logError } from './logService';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const uploadFile = async (file: File, userId: string): Promise<string> => {
  try {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('파일 용량은 5MB를 초과할 수 없습니다.');
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('허용되지 않는 파일 형식입니다. (JPG, PNG, PDF, DOC, DOCX만 가능)');
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const storageRef = ref(storage, `uploads/${userId}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    await logError(error.message, 'uploadFile', userId);
    throw new Error(error.message || '파일 업로드에 실패했습니다.');
  }
};

export const deleteFile = async (fileUrl: string, userId: string): Promise<void> => {
  try {
    if (!fileUrl) return;
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error: any) {
    await logError(error.message, 'deleteFile', userId);
    console.error('Failed to delete file:', error);
  }
};
