import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Schedule } from '../pages/Dashboard';
import { PART_COLORS, STATUS_COLORS } from '../utils/colors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  schedules: Schedule[];
}

export const DayDetailModal: React.FC<Props> = ({ isOpen, onClose, date, schedules }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-2xl shadow-2xl outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t-2xl">
            <h3 className="text-xl font-bold text-gray-900">
              {format(date, 'yyyy년 MM월 dd일')} 스케줄
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-900 float-right text-3xl leading-none font-semibold outline-none focus:outline-none transition-colors"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
          <div className="relative p-6 flex-auto max-h-[60vh] overflow-y-auto">
            {schedules.length === 0 ? (
              <p className="text-gray-500 text-center py-4">등록된 스케줄이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => {
                  const partColor = PART_COLORS[schedule.part] || PART_COLORS['기타'];
                  const statusColor = STATUS_COLORS[schedule.status];
                  
                  return (
                    <div key={schedule.id} className={`p-4 rounded-xl border ${partColor.border} bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${partColor.bg} ${partColor.text}`}>
                          {schedule.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{schedule.userName} <span className="text-xs font-normal text-gray-500 ml-1">{schedule.part}</span></p>
                          <p className="text-sm text-gray-600 font-medium">{schedule.type}</p>
                          {(schedule.startTime || schedule.endTime) && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {schedule.startTime || '?'} ~ {schedule.endTime || '?'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                          {schedule.status === 'pending' ? '승인 대기' : schedule.status === 'approved' ? '승인 완료' : '반려됨'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b">
            <button
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium text-sm px-6 py-2 rounded-lg transition-colors outline-none focus:outline-none"
              type="button"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
