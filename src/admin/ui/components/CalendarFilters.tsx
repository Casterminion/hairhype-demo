import { CheckCircle, XCircle, Clock, X } from 'lucide-react';

interface CalendarFiltersProps {
  filterStatus: string;
  onFilterChange: (status: string) => void;
  onClose: () => void;
}

export function CalendarFilters({ filterStatus, onFilterChange, onClose }: CalendarFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'Visi', icon: null, color: 'white/70' },
    { value: 'confirmed', label: 'Patvirtinti', icon: CheckCircle, color: '[var(--success)]' },
    { value: 'pending', label: 'Laukiama', icon: Clock, color: '[var(--gold)]' },
    { value: 'cancelled', label: 'Atšaukti', icon: XCircle, color: '[var(--danger)]' },
  ];

  return (
    <div className="bg-[#0C0F15] rounded-[16px] border border-white/[0.06] p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Filtruoti pagal būseną</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {statusOptions.map(({ value, label, icon: Icon, color }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`
              flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all
              ${filterStatus === value
                ? 'bg-[var(--gold)]/20 text-[var(--gold)] border-2 border-[var(--gold)]/40 shadow-[0_0_16px_rgba(181,142,76,0.15)]'
                : 'bg-white/[0.02] text-white/70 hover:bg-white/5 hover:text-white border border-white/[0.06]'
              }
            `}
          >
            {Icon && <Icon size={16} className={`text-${color}`} />}
            <span>{label}</span>
            {filterStatus === value && (
              <div className="ml-auto w-2 h-2 rounded-full bg-[var(--gold)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
