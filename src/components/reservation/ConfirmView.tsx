import { useEffect, useState } from 'react';
import { CheckCircle2, Calendar, Clock } from 'lucide-react';
import { formatVilniusDate, formatVilniusTime } from '../../lib/time';

interface ConfirmViewProps {
  serviceName: string;
  startTime: Date;
  customerName: string;
  onComplete: () => void;
}

export default function ConfirmView({ serviceName, startTime, customerName, onComplete }: ConfirmViewProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const dateStr = startTime.toLocaleDateString('lt-LT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeStr = formatVilniusTime(startTime);

  return (
    <div className="space-y-6 pb-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 size={36} className="text-green-600" />
        </div>

        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
          Patvirtinta!
        </h2>
        <p className="text-sm text-gray-600">
          Ačiū! Jūsų rezervacija sėkmingai priimta.
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-serif text-gray-900 mb-3">
              Rezervacijos detalės
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={16} className="text-gray-900" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Paslauga</p>
                <p className="text-sm font-semibold text-gray-900">{serviceName}</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-gray-900" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Data</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{dateStr}</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-gray-900" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Laikas</p>
                <p className="text-sm font-semibold text-gray-900">{timeStr}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-3">
        <p className="text-xs text-gray-600">
          Jei reikia perkelti ar atšaukti vizitą, susisiek su mumis telefonu arba Instagram.
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-900">
          <div className="w-5 h-5 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <span className="text-xs font-semibold">{countdown}</span>
          </div>
          <span>Grįžtama į pagrindinį puslapį...</span>
        </div>

        <button
          onClick={onComplete}
          className="text-gray-600 hover:text-gray-900 transition-colors text-xs font-medium underline"
        >
          Grįžti dabar
        </button>
      </div>
    </div>
  );
}
