import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getAvailableSlots } from '../../lib/api';
import { formatVilniusTime } from '../../lib/time';

interface TimePickerProps {
  serviceId: string;
  serviceName: string;
  date: Date;
  onSelect: (startISO: string) => void;
  onBack: () => void;
}

export default function TimePicker({ serviceId, serviceName, date, onSelect, onBack }: TimePickerProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    loadSlots();
  }, [serviceId, date]);

  async function loadSlots() {
    setLoading(true);
    try {
      const availableSlots = await getAvailableSlots(serviceId, date);
      setSlots(availableSlots);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setSlots([]);
    }
    setLoading(false);
  }

  function handleSlotClick(slotISO: string) {
    setSelectedSlot(slotISO);
    onSelect(slotISO);
  }

  return (
    <div className="space-y-5 pb-4">
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
      >
        ← Grįžti
      </button>

      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          Pasirink laiką
        </h2>
        <p className="text-sm font-medium text-gray-900">{serviceName}</p>
        <p className="text-xs text-gray-600 mt-1 capitalize">
          {date.toLocaleDateString('lt-LT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={40} className="mx-auto mb-3 text-gray-400" />
          <p className="text-lg text-gray-600 font-serif">
            Šiai dienai laikų nėra
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Pasirink kitą dieną arba susisiek tiesiogiai
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {slots.map((slotISO) => {
              const slotDate = new Date(slotISO);
              const timeStr = formatVilniusTime(slotDate);
              const isSelected = selectedSlot === slotISO;

              return (
                <button
                  key={slotISO}
                  onClick={() => handleSlotClick(slotISO)}
                  className={`
                    px-3 py-2 rounded-full text-center text-sm font-medium transition-all duration-200
                    ${isSelected
                      ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                      : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-900 hover:bg-gray-50'
                    }
                    hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1
                  `}
                >
                  {timeStr}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
