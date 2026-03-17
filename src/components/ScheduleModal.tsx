import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { X } from 'lucide-react';

const scheduleSchema = z.object({
  type: z.enum(['1근', '2근', '야근', '휴일근무', '연차', '시간연차', '병가', '시간병가', '공가', '특별휴가', '출산전후휴가', '배우자출산휴가', '가족돌봄휴가', '생리휴가', '포상휴가']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다.'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export const ScheduleModal: React.FC<Props> = ({ isOpen, onClose, selectedDate }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      date: format(selectedDate, 'yyyy-MM-dd'),
      type: '1근'
    }
  });

  const onSubmit = async (data: ScheduleForm) => {
    if (!user || !profile) return;
    
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'schedules'), {
        userId: user.uid,
        userName: profile.name,
        part: profile.part,
        type: data.type,
        date: data.date,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        status: 'pending', // Admins will approve
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || '스케줄 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-2xl shadow-2xl outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t-2xl">
            <h3 className="text-xl font-bold text-gray-900">
              스케줄 등록
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-900 float-right text-3xl leading-none font-semibold outline-none focus:outline-none transition-colors"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
          <div className="relative p-6 flex-auto">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">근무/휴가 종류</label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <optgroup label="근무">
                    <option value="1근">1근 (오전/주간)</option>
                    <option value="2근">2근 (오후/야간)</option>
                    <option value="야근">야근</option>
                    <option value="휴일근무">휴일근무</option>
                  </optgroup>
                  <optgroup label="연차/휴가">
                    <option value="연차">연차</option>
                    <option value="시간연차">시간연차 (반차 등)</option>
                    <option value="병가">병가</option>
                    <option value="시간병가">시간병가</option>
                    <option value="공가">공가 (예비군, 민방위 등)</option>
                    <option value="특별휴가">특별휴가 (경조사 등)</option>
                    <option value="출산전후휴가">출산전후휴가</option>
                    <option value="배우자출산휴가">배우자 출산휴가</option>
                    <option value="가족돌봄휴가">가족돌봄휴가</option>
                    <option value="생리휴가">생리휴가</option>
                    <option value="포상휴가">포상휴가</option>
                  </optgroup>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간 (선택)</label>
                  <input
                    type="time"
                    {...register('startTime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간 (선택)</label>
                  <input
                    type="time"
                    {...register('endTime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-6 border-t border-solid border-gray-200 rounded-b">
                <button
                  className="text-gray-500 bg-transparent hover:bg-gray-100 font-medium px-6 py-2 text-sm outline-none focus:outline-none mr-2 mb-1 rounded-lg transition-colors"
                  type="button"
                  onClick={onClose}
                >
                  취소
                </button>
                <button
                  className="bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-sm px-6 py-2 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 transition-all disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
