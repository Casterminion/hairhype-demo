import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, List, ScrollText, Star, Scissors, Plus, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  category: string;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'nav-dashboard',
      label: 'Eiti į Dashboard',
      icon: Calendar,
      category: 'Navigacija',
      action: () => { navigate('/admin/dashboard'); onClose(); }
    },
    {
      id: 'nav-calendar',
      label: 'Eiti į Kalendorių',
      icon: Calendar,
      category: 'Navigacija',
      action: () => { navigate('/admin/calendar'); onClose(); }
    },
    {
      id: 'nav-bookings',
      label: 'Eiti į Rezervacijas',
      icon: List,
      category: 'Navigacija',
      action: () => { navigate('/admin/bookings'); onClose(); }
    },
    {
      id: 'nav-blogs',
      label: 'Eiti į Tinklaraščius',
      icon: ScrollText,
      category: 'Navigacija',
      action: () => { navigate('/admin/blogs'); onClose(); }
    },
    {
      id: 'nav-reviews',
      label: 'Eiti į Atsiliepimus',
      icon: Star,
      category: 'Navigacija',
      action: () => { navigate('/admin/reviews'); onClose(); }
    },
    {
      id: 'nav-services',
      label: 'Eiti į Paslaugas',
      icon: Scissors,
      category: 'Navigacija',
      action: () => { navigate('/admin/services'); onClose(); }
    },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0C0F15] rounded-[20px] shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
          <Search size={20} className="text-white/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ieškoti veiksmų arba puslapių..."
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/50">
              Rezultatų nerasta
            </div>
          ) : (
            <div className="space-y-1 px-2">
              {filteredCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-left transition-all
                      ${index === selectedIndex
                        ? 'bg-[var(--gold)]/20 text-white border border-[var(--gold)]/30'
                        : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      ${index === selectedIndex ? 'bg-[var(--gold)]/20' : 'bg-white/5'}
                    `}>
                      <Icon size={16} className={index === selectedIndex ? 'text-[var(--gold)]' : 'text-white/60'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{cmd.label}</p>
                      <p className="text-xs text-white/40 truncate">{cmd.category}</p>
                    </div>
                    {index === selectedIndex && (
                      <div className="text-xs text-white/40 flex-shrink-0">Enter</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">↑↓</kbd>
              <span>Naršyti</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">Enter</kbd>
              <span>Pasirinkti</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">Esc</kbd>
              <span>Uždaryti</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
