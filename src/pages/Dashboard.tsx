import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getHoliday } from '../utils/date';
import { PART_COLORS } from '../utils/colors';
import { ScheduleModal } from '../components/ScheduleModal';
import { DayDetailModal } from '../components/DayDetailModal';

export interface Schedule {
  id: string;
  userId: string;
  userName: string;
  part: string;
  type: string;
  date: string;
  startTime?: string;
  endTime?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const Dashboard = () => {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [dayDetailDate, setDayDetailDate] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch schedules for the current month
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    const q = query(
      collection(db, 'schedules'),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSchedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Schedule[];
      setSchedules(fetchedSchedules);
    }, (error) => {
      console.error("Error fetching schedules:", error);
    });

    return () => unsubscribe();
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsScheduleModalOpen(true);
  };

  const handleMoreClick = (e: React.MouseEvent, day: Date) => {
    e.stopPropagation();
    setDayDetailDate(day);
    setIsDayDetailModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'yyyy년 M월')}
          </h2>
          <div className="flex space-x-1">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <button
          onClick={() => { setSelectedDate(new Date()); setIsScheduleModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          스케줄 등록
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div key={day} className={`py-2 text-center text-sm font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const holiday = getHoliday(dateStr);
            const isSunday = day.getDay() === 0;
            const isSaturday = day.getDay() === 6;
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            
            const daySchedules = schedules.filter(s => s.date === dateStr);
            const displaySchedules = daySchedules.slice(0, 5);
            const hasMore = daySchedules.length > 5;

            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={`min-h-[120px] border-b border-r border-gray-100 p-1.5 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col ${
                  !isCurrentMonth ? 'bg-gray-50/50 opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-indigo-600 text-white' : 
                    holiday || isSunday ? 'text-red-500' : 
                    isSaturday ? 'text-blue-500' : 'text-gray-700'
                  }`}>
                    {format(day, dateFormat)}
                  </span>
                  {holiday && (
                    <span className="text-[10px] font-medium text-red-500 truncate max-w-[60px]">
                      {holiday}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
                  {displaySchedules.map((schedule) => {
                    const colors = PART_COLORS[schedule.part] || PART_COLORS['기타'];
                    return (
                      <div
                        key={schedule.id}
                        className={`text-[11px] px-1.5 py-0.5 rounded truncate ${colors.bg} ${colors.text} ${
                          schedule.status === 'pending' ? 'opacity-60 border border-dashed ' + colors.border : ''
                        }`}
                        title={`${schedule.userName} - ${schedule.type}`}
                      >
                        <span className="font-medium">{schedule.userName}</span> {schedule.type}
                      </div>
                    );
                  })}
                  {hasMore && (
                    <div 
                      onClick={(e) => handleMoreClick(e, day)}
                      className="text-[11px] text-gray-500 font-medium hover:text-indigo-600 cursor-pointer text-center py-0.5"
                    >
                      +{daySchedules.length - 5}개 더보기
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isScheduleModalOpen && selectedDate && (
        <ScheduleModal 
          isOpen={isScheduleModalOpen} 
          onClose={() => setIsScheduleModalOpen(false)} 
          selectedDate={selectedDate} 
        />
      )}

      {isDayDetailModalOpen && dayDetailDate && (
        <DayDetailModal
          isOpen={isDayDetailModalOpen}
          onClose={() => setIsDayDetailModalOpen(false)}
          date={dayDetailDate}
          schedules={schedules.filter(s => s.date === format(dayDetailDate, 'yyyy-MM-dd'))}
        />
      )}
    </div>
  );
};
