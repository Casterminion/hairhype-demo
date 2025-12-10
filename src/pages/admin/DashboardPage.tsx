import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, Euro, Clock, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AppShell } from '../../admin/ui/AppShell';
import { Card } from '../../admin/ui/primitives/Card';
import { Skeleton } from '../../admin/ui/primitives/Skeleton';
import { formatVilniusDateTime } from '../../utils/datetime';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import moment from 'moment';

interface DashboardStats {
  todayBookings: number;
  todayRevenue: number;
  weeklyCompletion: number;
  monthlyRevenue: number;
  totalReviews: number;
  averageRating: number;
  trendBookings: number;
  trendRevenue: number;
}

interface WeeklyData {
  day: string;
  count: number;
}

interface UpcomingBooking {
  id: string;
  start_time_utc: string;
  customer: { name: string };
  service: { name: string };
  status: string;
}

interface RecentReview {
  id: string;
  name: string;
  rating: number;
  review: string;
  created_at: string;
}

export function DashboardPage() {
  useDocumentTitle('Admin');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadUpcoming(), loadReviews(), loadWeeklyData()]);
    setLoading(false);
  };

  const loadStats = async () => {
    const todayStart = moment().startOf('day').toISOString();
    const todayEnd = moment().endOf('day').toISOString();
    const monthStart = moment().startOf('month').toISOString();
    const monthEnd = moment().endOf('month').toISOString();
    const lastMonthStart = moment().subtract(1, 'month').startOf('month').toISOString();
    const lastMonthEnd = moment().subtract(1, 'month').endOf('month').toISOString();

    const [bookingsToday, bookingsMonth, bookingsLastMonth, reviews] = await Promise.all([
      supabase
        .from('bookings')
        .select('service:services(price_eur)', { count: 'exact' })
        .gte('start_time_utc', todayStart)
        .lte('start_time_utc', todayEnd)
        .eq('status', 'confirmed'),
      supabase
        .from('bookings')
        .select('service:services(price_eur)', { count: 'exact' })
        .gte('start_time_utc', monthStart)
        .lte('start_time_utc', monthEnd)
        .eq('status', 'confirmed'),
      supabase
        .from('bookings')
        .select('service:services(price_eur)', { count: 'exact' })
        .gte('start_time_utc', lastMonthStart)
        .lte('start_time_utc', lastMonthEnd)
        .eq('status', 'confirmed'),
      supabase
        .from('reviews')
        .select('rating', { count: 'exact' })
    ]);

    const todayRev = bookingsToday.data?.reduce((sum, b: any) => sum + (parseFloat(b.service?.price_eur) || 0), 0) || 0;
    const monthRev = bookingsMonth.data?.reduce((sum, b: any) => sum + (parseFloat(b.service?.price_eur) || 0), 0) || 0;
    const lastMonthRev = bookingsLastMonth.data?.reduce((sum, b: any) => sum + (parseFloat(b.service?.price_eur) || 0), 0) || 0;

    const avgRating = reviews.data && reviews.data.length > 0
      ? reviews.data.reduce((sum, r) => sum + r.rating, 0) / reviews.data.length
      : 0;

    const trendRev = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev) * 100 : 0;
    const currentMonthCount = bookingsMonth.count || 0;
    const lastMonthCount = bookingsLastMonth.count || 0;
    const trendBookings = lastMonthCount > 0
      ? ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100
      : currentMonthCount > 0 ? 100 : 0;

    setStats({
      todayBookings: bookingsToday.count || 0,
      todayRevenue: todayRev,
      weeklyCompletion: 94,
      monthlyRevenue: monthRev,
      totalReviews: reviews.count || 0,
      averageRating: avgRating,
      trendBookings,
      trendRevenue: trendRev
    });
  };

  const loadUpcoming = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('id, start_time_utc, status, customer:customers(name), service:services(name)')
      .gte('start_time_utc', new Date().toISOString())
      .eq('status', 'confirmed')
      .order('start_time_utc')
      .limit(5);

    if (data) {
      setUpcomingBookings(data as unknown as UpcomingBooking[]);
    }
  };

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) {
      setRecentReviews(data);
    }
  };

  const loadWeeklyData = async () => {
    const weekDays = ['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'];
    const today = moment();
    const startOfWeek = moment().startOf('isoWeek');
    const weeklyBookings: WeeklyData[] = [];

    for (let i = 0; i < 7; i++) {
      const date = moment(startOfWeek).add(i, 'days');

      if (date.isAfter(today, 'day')) {
        weeklyBookings.push({
          day: weekDays[i],
          count: 0
        });
        continue;
      }

      const dayStart = date.startOf('day').toISOString();
      const dayEnd = date.endOf('day').toISOString();

      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('start_time_utc', dayStart)
        .lte('start_time_utc', dayEnd);

      weeklyBookings.push({
        day: weekDays[i],
        count: count || 0
      });
    }

    setWeeklyData(weeklyBookings);
  };

  const StatCard = ({ icon: Icon, label, value, subtext, trend, trendUp }: any) => (
    <Card className="bg-[var(--navy)] border-white/[0.06] hover:border-[var(--gold)]/20 active:border-[var(--gold)]/30 transition-all duration-300 group touch-manipulation active:scale-[0.98]">
      <Card.Body className="flex items-start justify-between p-4 sm:p-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--gold)]/20 group-hover:bg-[var(--gold)]/20 transition-colors">
              <Icon size={20} className="text-[var(--gold)]" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wider truncate">{label}</p>
          </div>
          <p className="serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-1 truncate">{value}</p>
          {subtext && <p className="text-sm sm:text-base text-white/50 truncate">{subtext}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs sm:text-sm font-medium ${trendUp ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span className="truncate">{Math.abs(trend).toFixed(1)}% vs last month</span>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <AppShell>
      <AppShell.Page
        title="Apžvalga"
        subtitle="Pagrindinė apžvalga ir statistika"
      >
        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[var(--navy)] rounded-2xl border border-white/[0.06] p-4 sm:p-6">
                    <Skeleton width="60%" className="mb-4" />
                    <Skeleton width="40%" height="40px" className="mb-2" />
                    <Skeleton width="30%" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <StatCard
                  icon={Calendar}
                  label="Šiandien rezervacijų"
                  value={stats?.todayBookings || 0}
                  subtext={`€${stats?.todayRevenue.toFixed(2)} pajamos`}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Mėnesio apyvarta"
                  value={`€${stats?.monthlyRevenue.toFixed(0)}`}
                  trend={stats?.trendRevenue}
                  trendUp={(stats?.trendRevenue || 0) >= 0}
                />
                <StatCard
                  icon={Users}
                  label="Rezervacijų augimas"
                  value={`${stats?.trendBookings >= 0 ? '+' : ''}${stats?.trendBookings.toFixed(1)}%`}
                  subtext="Palyginti su praėjusiu mėn."
                />
                <StatCard
                  icon={Star}
                  label="Vidutinis įvertinimas"
                  value={stats?.averageRating.toFixed(1)}
                  subtext={`${stats?.totalReviews} atsiliepimai`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[var(--navy)] border-white/[0.06]">
                  <Card.Header>
                    <div className="flex items-center justify-between">
                      <h2 className="serif text-xl font-semibold text-white">Artimiausi vizitai</h2>
                      <Clock size={20} className="text-[var(--gold)]" />
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {upcomingBookings.length === 0 ? (
                      <p className="text-white/50 text-center py-8">Nėra artimų rezervacijų</p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-[var(--gold)]/20 hover:bg-white/[0.04] transition-all"
                          >
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--gold)]/20">
                              <Calendar size={20} className="text-[var(--gold)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white truncate">{booking.customer?.name || 'Klientas'}</p>
                              <p className="text-sm text-white/50 truncate">{booking.service?.name || 'Paslauga'}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-medium text-white">
                                {moment(booking.start_time_utc).format('HH:mm')}
                              </p>
                              <p className="text-xs text-white/50">
                                {moment(booking.start_time_utc).format('MMM DD')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>

                <Card className="bg-[var(--navy)] border-white/[0.06]">
                  <Card.Header>
                    <div className="flex items-center justify-between">
                      <h2 className="serif text-xl font-semibold text-white">Naujausi atsiliepimai</h2>
                      <Star size={20} className="text-[var(--gold)]" />
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {recentReviews.length === 0 ? (
                      <p className="text-white/50 text-center py-8">Nėra atsiliepimų</p>
                    ) : (
                      <div className="space-y-4">
                        {recentReviews.map((review) => (
                          <div
                            key={review.id}
                            className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--gold)]/20">
                                <span className="text-xs font-semibold text-[var(--gold)]">
                                  {review.name ? review.name.charAt(0).toUpperCase() : '?'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{review.name || 'Anonimas'}</p>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={i < review.rating ? 'text-[var(--gold)] fill-[var(--gold)]' : 'text-white/20'}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-white/70 line-clamp-2">{review.review || 'Komentaras nepateiktas'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>

              <Card className="bg-[var(--navy)] border-white/[0.06]">
                <Card.Header>
                  <h2 className="serif text-xl font-semibold text-white">Savaitės apžvalga</h2>
                </Card.Header>
                <Card.Body>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyData.map((dayData, i) => {
                      const maxBookings = Math.max(...weeklyData.map(d => d.count), 1);
                      const maxHeight = 100;
                      const height = (dayData.count / maxBookings) * maxHeight;

                      return (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className="text-xs font-medium text-white/60">{dayData.day}</div>
                          <div className="relative w-full bg-white/[0.04] rounded-lg overflow-hidden" style={{ height: `${maxHeight}px` }}>
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--gold)] to-[var(--gold)]/40 rounded-t-lg transition-all duration-500"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <div className="text-xs font-semibold text-white">{dayData.count}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </div>
      </AppShell.Page>
    </AppShell>
  );
}
