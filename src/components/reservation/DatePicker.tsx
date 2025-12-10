import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, isAfter, isBefore, format, startOfDay } from 'date-fns';
import { lt } from 'date-fns/locale';
import { generateServiceSlots } from '../../lib/slots';

interface DatePickerProps {
  onSelect: (date: Date) => void;
  onBack: () => void;
  serviceDurationMin?: number;
}

export default function DatePicker({ onSelect, onBack, serviceDurationMin = 40 }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableDates();
  }, [currentMonth, serviceDurationMin]);

  async function loadAvailableDates() {
    setLoading(true);
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const available = new Set<string>();

    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });

    let day = start;
    const promises = [];

    while (day <= end) {
      const checkDay = new Date(day);
      if (isAfter(checkDay, today) && !isAfter(checkDay, maxDate)) {
        promises.push(
          generateServiceSlots(checkDay, serviceDurationMin)
            .then(slots => {
              const dateStr = format(checkDay, 'yyyy-MM-dd');
              console.log(`[DatePicker] ${dateStr}: ${slots.length} slots available`, slots);
              if (slots.length > 0) {
                available.add(dateStr);
              }
            })
            .catch(err => {
              const dateStr = format(checkDay, 'yyyy-MM-dd');
              console.error(`[DatePicker] Error checking ${dateStr}:`, err);
            })
        );
      }
      day = addDays(day, 1);
    }

    await Promise.all(promises);
    console.log('[DatePicker] Available dates:', Array.from(available));
    setAvailableDates(available);
    setLoading(false);
  }

  function handleDateClick(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (availableDates.has(dateStr)) {
      setSelectedDate(date);
      onSelect(date);
    }
  }

  function renderCalendar() {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dateStr = format(cloneDay, 'yyyy-MM-dd');
        const isCurrentMonth = isSameMonth(cloneDay, monthStart);
        const isPast = isBefore(cloneDay, today) || isSameDay(cloneDay, today);
        const isBeyondHorizon = isAfter(cloneDay, maxDate);
        const isAvailable = availableDates.has(dateStr);
        const isDisabled = !isCurrentMonth || isPast || isBeyondHorizon || !isAvailable;
        const isSelected = selectedDate && isSameDay(cloneDay, selectedDate);

        days.push(
          <button
            key={day.toString()}
            onClick={() => !isDisabled && handleDateClick(cloneDay)}
            disabled={isDisabled}
            className={`
              aspect-square rounded-lg text-xs md:text-sm font-medium transition-all duration-200
              ${isDisabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-900 hover:bg-gray-100 hover:border-gray-900 hover:scale-105 cursor-pointer'
              }
              ${isSelected
                ? 'bg-gray-900 text-white hover:bg-gray-900'
                : 'bg-white border border-gray-200'
              }
              ${!isCurrentMonth ? 'opacity-40' : ''}
            `}
          >
            {format(cloneDay, 'd')}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1.5">
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  }

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
      >
        ← Grįžti
      </button>

      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-1">
          Pasirink datą
        </h2>
        <p className="text-xs text-gray-600">Artimiausi 30 dienų</p>
      </div>

      <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
            disabled={isBefore(addDays(currentMonth, -30), startOfDay(new Date()))}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} className="text-gray-900" />
          </button>

          <h3 className="text-base md:text-lg font-serif text-gray-900 capitalize">
            {format(currentMonth, 'LLLL yyyy', { locale: lt })}
          </h3>

          <button
            onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
            disabled={isAfter(startOfMonth(addDays(currentMonth, 30)), addDays(startOfDay(new Date()), 30))}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} className="text-gray-900" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
          </div>
        ) : (
          <div className="space-y-1.5">
            {renderCalendar()}
          </div>
        )}
      </div>
    </div>
  );
}
