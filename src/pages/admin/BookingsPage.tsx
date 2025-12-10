import { useState, useEffect } from 'react';
import { Search, Calendar, User, Phone, CheckCircle, XCircle, Clock, CheckCheck, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatVilniusDateTime } from '../../utils/datetime';
import { AppShell, useTheme } from '../../admin/ui/AppShell';
import { Input } from '../../admin/ui/primitives/Input';
import { SkeletonTable } from '../../admin/ui/primitives/Skeleton';
import { EmptyState } from '../../admin/ui/primitives/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { themeClasses } from '../../admin/ui/utils/themeClasses';

interface Booking {
  id: string;
  start_time_utc: string;
  end_time_utc: string;
  service: {
    name: string;
    duration_min: number;
  };
  customer: {
    name: string;
    phone_e164: string;
  };
  status: string;
}

type BookingStatus = 'scheduled' | 'in_progress' | 'finished' | 'cancelled';

const getBookingStatus = (startTimeUtc: string, endTimeUtc: string, bookingStatus: string): BookingStatus => {
  if (bookingStatus === 'cancelled') return 'cancelled';

  const now = new Date();
  const startTime = new Date(startTimeUtc);
  const endTime = new Date(endTimeUtc);

  if (now >= endTime) return 'finished';
  if (now >= startTime && now < endTime) return 'in_progress';
  return 'scheduled';
};

const statusConfig = {
  scheduled: {
    label: 'Suplanuota',
    icon: Clock,
    className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  },
  in_progress: {
    label: 'Vyksta',
    icon: Play,
    className: 'bg-green-500/10 text-green-400 border border-green-500/20'
  },
  finished: {
    label: 'Pasibaigė',
    icon: CheckCheck,
    className: 'bg-white/10 text-white/50 border border-white/10'
  },
  cancelled: {
    label: 'Atšaukta',
    icon: XCircle,
    className: 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
  }
};

export function BookingsPage() {
  useDocumentTitle('Admin');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select(`
        id,
        start_time_utc,
        end_time_utc,
        status,
        service:services(name, duration_min),
        customer:customers(name, phone_e164)
      `)
      .order('start_time_utc', { ascending: false })
      .limit(50);

    if (data) {
      setBookings(data as unknown as Booking[]);
    }
    setLoading(false);
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.phone_e164.includes(searchTerm)
  );

  return (
    <AppShell>
      <AppShell.Page
        title="Rezervacijos"
        subtitle="Tvarkykite klientų vizitus ir rezervacijas"
      >
        <div className="space-y-4 sm:space-y-6">
          {/* Search Bar - Mobile Optimized */}
          <div className="bg-[var(--navy)] rounded-2xl p-3 sm:p-4 border border-white/[0.06]">
            <div className="relative">
              <Search size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="search"
                inputMode="search"
                placeholder="Ieškoti pagal vardą arba telefoną..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60 focus:border-[var(--gold)] transition-all touch-manipulation"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-[var(--navy)] rounded-2xl p-6 border border-white/[0.06]">
              <SkeletonTable rows={8} />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-[var(--navy)] rounded-2xl overflow-hidden border border-white/[0.06]">
              <EmptyState
                icon={Calendar}
                title="Rezervacijų nerasta"
                description={searchTerm ? "Pabandykite kitą paieškos užklausą" : "Dar nėra užregistruotų rezervacijų"}
              />
            </div>
          ) : (
            <>
              {/* MOBILE CARD VIEW - Only visible on mobile */}
              <div className="md:hidden space-y-3">
                {filteredBookings.map((booking) => {
                  const currentStatus = getBookingStatus(
                    booking.start_time_utc,
                    booking.end_time_utc,
                    booking.status
                  );
                  const status = statusConfig[currentStatus];
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={booking.id}
                      className="bg-[#1C2128] rounded-2xl p-4 border border-white/[0.08] hover:border-[#B58E4C]/40 transition-all shadow-lg active:scale-[0.99]"
                    >
                      {/* Header: Date & Status */}
                      <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center flex-shrink-0">
                            <Calendar size={20} className="text-[var(--gold)]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {formatVilniusDateTime(booking.start_time_utc).split(' ')[0]}
                            </p>
                            <p className="text-lg font-semibold text-[var(--gold)] tabular-nums">
                              {formatVilniusDateTime(booking.start_time_utc).split(' ')[1]}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${status.className}`}>
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                      </div>

                      {/* Service */}
                      <div className="mb-3">
                        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1">Paslauga</p>
                        <p className="text-base font-semibold text-white">
                          {booking.service.name}
                        </p>
                        <p className="text-xs text-white/60 mt-0.5">
                          Trukmė: {booking.service.duration_min} min.
                        </p>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <User size={16} className="text-white/60" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/50">Klientas</p>
                            <p className="text-sm font-semibold text-white truncate">
                              {booking.customer.name}
                            </p>
                          </div>
                        </div>

                        <a
                          href={`tel:${booking.customer.phone_e164}`}
                          className="flex items-center gap-2.5 bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 active:bg-[var(--gold)]/25 rounded-xl p-3 transition-all border border-[var(--gold)]/20 hover:border-[var(--gold)]/40 min-h-[52px]"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/20 flex items-center justify-center flex-shrink-0">
                            <Phone size={16} className="text-[var(--gold)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[var(--gold)]/80">Telefonas</p>
                            <p className="text-base font-bold text-[var(--gold)] font-mono">
                              {booking.customer.phone_e164}
                            </p>
                          </div>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE VIEW - Only visible on desktop */}
              <div className="hidden md:block bg-[var(--navy)] rounded-2xl shadow-[var(--shadow-high)] overflow-hidden border border-white/[0.06]">
                <div className="overflow-x-auto scrollbar-hide -mx-px">
                  <table className="w-full">
                    <thead className="bg-white/[0.02] border-b border-white/[0.06] sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider whitespace-nowrap">
                          Data ir laikas
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider whitespace-nowrap">
                          Paslauga
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider whitespace-nowrap">
                          Klientas
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider whitespace-nowrap">
                          Telefonas
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider whitespace-nowrap">
                          Būsena
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredBookings.map((booking) => {
                        const currentStatus = getBookingStatus(
                          booking.start_time_utc,
                          booking.end_time_utc,
                          booking.status
                        );
                        const status = statusConfig[currentStatus];
                        const StatusIcon = status.icon;

                        return (
                          <tr
                            key={booking.id}
                            className="hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center flex-shrink-0">
                                  <Calendar size={16} className="text-[var(--gold)]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {formatVilniusDateTime(booking.start_time_utc).split(' ')[0]}
                                  </p>
                                  <p className="text-xs text-white/50">
                                    {formatVilniusDateTime(booking.start_time_utc).split(' ')[1]}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-white/70 font-medium">
                                {booking.service.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-white/40 flex-shrink-0" />
                                <span className="text-sm text-white/70 truncate">
                                  {booking.customer.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <a
                                href={`tel:${booking.customer.phone_e164}`}
                                className="flex items-center gap-2 text-[var(--gold)] hover:text-[var(--gold)]/80 active:text-[var(--gold)]/90 transition-colors group"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone size={14} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                                <span className="text-sm font-mono underline decoration-[var(--gold)]/30 group-hover:decoration-[var(--gold)]/60">
                                  {booking.customer.phone_e164}
                                </span>
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.className}`}>
                                <StatusIcon size={12} />
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Stats Footer */}
          {!loading && filteredBookings.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/50 px-1">
              <p>Rodoma {filteredBookings.length} rezervacijų</p>
              <p className="text-xs sm:text-sm">Iš viso pakrovta 50 naujausių</p>
            </div>
          )}
        </div>
      </AppShell.Page>
    </AppShell>
  );
}
