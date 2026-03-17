import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Trash2, FileText, Download } from 'lucide-react';
import { Schedule, deleteSchedule } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { deleteFile } from '../services/storageService';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  schedules: Schedule[];
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ isOpen, onClose, date, schedules }) => {
  const { userProfile } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen || !userProfile) return null;

  const handleDelete = async (schedule: Schedule) => {
    if (!window.confirm('정말 이 일정을 삭제하시겠습니까?')) return;
    
    setLoadingId(schedule.id);
    try {
      if (schedule.fileUrl) {
        await deleteFile(schedule.fileUrl, userProfile.uid);
      }
      await deleteSchedule(schedule.id, userProfile.uid);
      onClose(); // Refresh handled by parent
    } catch (error) {
      alert('삭제에 실패했습니다.');
    } finally {
      setLoadingId(null);
    }
  };

  const canDelete = (schedule: Schedule) => {
    return schedule.userId === userProfile.uid || ['팀장', '부팀장', '사례관리사', '파트장'].includes(userProfile.role);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative inline-block w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {format(date, 'yyyy년 MM월 dd일')} 상세 일정
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 일정이 없습니다.
              </div>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{schedule.title}</h4>
                      <p className="text-sm text-gray-500 font-medium">{schedule.userName}</p>
                    </div>
                    {canDelete(schedule) && (
                      <button
                        onClick={() => handleDelete(schedule)}
                        disabled={loadingId === schedule.id}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="일정 삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  
                  {schedule.description && (
                    <div className="mt-3 text-gray-700 text-sm whitespace-pre-wrap bg-white p-3 rounded border border-gray-100">
                      {schedule.description}
                    </div>
                  )}

                  {schedule.fileUrl && (
                    <div className="mt-4 flex items-center">
                      <a
                        href={schedule.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <FileText size={14} className="mr-1.5 text-gray-400" />
                        첨부파일 보기
                        <Download size={14} className="ml-1.5 text-gray-400" />
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
