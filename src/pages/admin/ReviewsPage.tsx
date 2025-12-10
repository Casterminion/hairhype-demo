import { useState, useEffect } from 'react';
import { Star, Trash2, MessageSquare, TrendingUp, BarChart3, Quote } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AppShell } from '../../admin/ui/AppShell';
import { Card } from '../../admin/ui/primitives/Card';
import { Button } from '../../admin/ui/primitives/Button';
import { ConfirmModal } from '../../admin/ui/primitives/Modal';
import { showToast } from '../../admin/ui/primitives/Toast';
import { Skeleton } from '../../admin/ui/primitives/Skeleton';
import { EmptyState } from '../../admin/ui/primitives/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface Review {
  id: string;
  name: string;
  rating: number;
  review: string;
  created_at: string;
  published: boolean;
  source: string;
}

interface StarBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export function ReviewsPage() {
  useDocumentTitle('Admin');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ total: 0, average: 0 });
  const [starBreakdown, setStarBreakdown] = useState<StarBreakdown>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
      const total = data.length;
      const average = total > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / total : 0;
      setStats({ total, average });

      const breakdown: StarBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach((review) => {
        if (review.rating >= 1 && review.rating <= 5) {
          breakdown[review.rating as keyof StarBreakdown]++;
        }
      });
      setStarBreakdown(breakdown);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedReviewId || deleting) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('admin_session_token');
      if (!token) {
        showToast('error', 'Sesija negaliojanti');
        setDeleting(false);
        return;
      }

      const { data, error } = await supabase.rpc('admin_delete_review', {
        p_token: token,
        p_review_id: selectedReviewId
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Nepavyko ištrinti atsiliepimo');
      }

      showToast('success', 'Atsiliepimas sėkmingai ištrintas');
      setDeleteModalOpen(false);
      setSelectedReviewId(null);
      await loadReviews();
    } catch (err: any) {
      showToast('error', err.message || 'Įvyko klaida trinant atsiliepimą');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStarPercentage = (star: number) => {
    if (stats.total === 0) return 0;
    return Math.round((starBreakdown[star as keyof StarBreakdown] / stats.total) * 100);
  };

  const getStarColor = (star: number) => {
    if (star === 5) return 'from-emerald-500 to-emerald-600';
    if (star === 4) return 'from-green-500 to-green-600';
    if (star === 3) return 'from-yellow-500 to-yellow-600';
    if (star === 2) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const handleRatingFilter = (star: number) => {
    if (selectedRating === star) {
      setSelectedRating(null);
    } else {
      setSelectedRating(star);
    }
  };

  const filteredReviews = selectedRating
    ? reviews.filter(review => review.rating === selectedRating)
    : reviews;

  return (
    <AppShell>
      <AppShell.Page
        title="Atsiliepimai"
        subtitle="Peržiūrėkite ir tvarkykite klientų atsiliepimus"
      >
        <div className="space-y-8">
          {/* Stats Cards - Enhanced with gradients and shadows */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Reviews */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-[#0D1117] to-[#161B22] border-[#30363D] hover:border-[#9333EA]/40 transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#9333EA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Card.Body className="relative flex items-center justify-between p-6">
                <div>
                  <p className="text-xs font-semibold text-[#9333EA] mb-2 uppercase tracking-widest">
                    Iš viso atsiliepimų
                  </p>
                  <p className="text-5xl font-bold text-white mb-1 tracking-tight">
                    {loading ? '...' : stats.total}
                  </p>
                  <p className="text-sm text-white/50">Publikuoti atsiliepimai</p>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#9333EA]/20 to-[#9333EA]/5 flex items-center justify-center shadow-lg shadow-[#9333EA]/10 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare size={36} className="text-[#9333EA]" strokeWidth={2.5} />
                </div>
              </Card.Body>
            </Card>

            {/* Average Rating */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-[#0D1117] to-[#161B22] border-[#30363D] hover:border-amber-500/40 transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Card.Body className="relative flex items-center justify-between p-6">
                <div>
                  <p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-widest">
                    Vidutinis įvertinimas
                  </p>
                  <div className="flex items-baseline gap-3 mb-1">
                    <p className="text-5xl font-bold text-white tracking-tight">
                      {loading ? '...' : stats.average.toFixed(1)}
                    </p>
                    <Star size={28} className="text-amber-400 fill-amber-400 mb-1" strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < Math.round(stats.average)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-white/15'
                        }`}
                        strokeWidth={2}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        5 - i <= Math.round(stats.average)
                          ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* 5-Star Reviews */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-[#0D1117] to-[#161B22] border-[#30363D] hover:border-emerald-500/40 transition-all duration-300 group md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Card.Body className="relative flex items-center justify-between p-6">
                <div>
                  <p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-widest">
                    5 žvaigždučių
                  </p>
                  <p className="text-5xl font-bold text-white mb-1 tracking-tight">
                    {loading ? '...' : starBreakdown[5]}
                  </p>
                  <p className="text-sm text-white/50">
                    {loading ? '' : `${getStarPercentage(5)}% visų atsiliepimų`}
                  </p>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp size={36} className="text-emerald-400" strokeWidth={2.5} />
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Star Rating Breakdown - Completely Redesigned */}
          <Card className="bg-gradient-to-br from-[#0D1117] to-[#161B22] border-[#30363D] overflow-hidden">
            <Card.Body className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9333EA]/20 to-[#9333EA]/5 flex items-center justify-center shadow-lg shadow-[#9333EA]/10">
                  <BarChart3 size={24} className="text-[#9333EA]" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Įvertinimų pasiskirstymas
                  </h2>
                  <p className="text-sm text-white/50 mt-0.5">
                    Atsiliepimų skaičius pagal žvaigždučių skaičių
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-5">
                      <Skeleton width="80px" height="32px" />
                      <Skeleton className="flex-1" height="32px" />
                      <Skeleton width="60px" height="32px" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const percentage = getStarPercentage(star);
                    const count = starBreakdown[star as keyof StarBreakdown];
                    const isSelected = selectedRating === star;

                    return (
                      <button
                        key={star}
                        onClick={() => handleRatingFilter(star)}
                        className={`w-full group transition-all duration-200 ${
                          isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                        }`}
                      >
                        <div className={`flex items-center gap-5 rounded-xl p-3 -mx-3 transition-all ${
                          isSelected
                            ? 'bg-white/10 ring-2 ring-[#9333EA]/60 shadow-lg shadow-[#9333EA]/20'
                            : 'hover:bg-white/5'
                        }`}>
                          {/* Star Label */}
                          <div className="flex items-center gap-2 w-24">
                            <span className="text-base font-bold text-white min-w-[20px]">{star}</span>
                            <Star
                              size={16}
                              className={`transition-all ${
                                isSelected
                                  ? 'text-[#9333EA] fill-[#9333EA] scale-110'
                                  : 'text-amber-400 fill-amber-400'
                              }`}
                              strokeWidth={2.5}
                            />
                          </div>

                          {/* Progress Bar */}
                          <div className="flex-1 relative">
                            <div className={`h-8 bg-white/5 rounded-full overflow-hidden border transition-all ${
                              isSelected
                                ? 'border-[#9333EA]/40'
                                : 'border-white/5 group-hover:border-white/10'
                            }`}>
                              <div
                                className={`h-full bg-gradient-to-r ${getStarColor(star)} transition-all duration-700 ease-out flex items-center justify-end px-3 shadow-lg relative`}
                                style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                              >
                                <div className={`absolute inset-0 transition-opacity ${
                                  isSelected ? 'bg-white/20' : 'bg-white/10'
                                }`} />
                                {count > 0 && (
                                  <span className="text-xs font-bold text-white relative z-10 drop-shadow-lg">
                                    {count}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Percentage */}
                          <div className="w-16 text-right">
                            <span className="text-base font-bold text-white">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Reviews List - Enhanced Design */}
          <Card className="bg-gradient-to-br from-[#0D1117] to-[#161B22] border-[#30363D]">
            <Card.Body className="p-0">
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Visi atsiliepimai
                    </h2>
                    {selectedRating && (
                      <p className="text-sm text-white/50 mt-1">
                        Filtruojami pagal {selectedRating} žvaigždučių įvertinimą
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedRating && (
                      <button
                        onClick={() => setSelectedRating(null)}
                        className="text-sm font-semibold text-[#9333EA] hover:text-[#9333EA]/80 bg-[#9333EA]/10 hover:bg-[#9333EA]/20 px-3 py-1.5 rounded-lg border border-[#9333EA]/20 hover:border-[#9333EA]/40 transition-all"
                      >
                        Valyti filtrą
                      </button>
                    )}
                    <span className="text-sm font-semibold text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      {filteredReviews.length} {filteredReviews.length === 1 ? 'atsiliepimas' : 'atsiliepimai'}
                    </span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-8 space-y-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-5">
                      <Skeleton variant="circular" width="64px" height="64px" />
                      <div className="flex-1 space-y-3">
                        <Skeleton width="40%" height="24px" />
                        <Skeleton width="100%" height="20px" />
                        <Skeleton width="100%" height="20px" />
                        <Skeleton width="30%" height="16px" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="p-16">
                  <EmptyState
                    icon={MessageSquare}
                    title={selectedRating ? "Atsiliepimų su šiuo įvertinimu nerasta" : "Atsiliepimų nerasta"}
                    description={selectedRating ? `Nėra atsiliepimų su ${selectedRating} žvaigždučių įvertinimu.` : "Dar nėra užregistruotų atsiliepimų. Jie bus rodomi čia, kai klientai paliks atsiliepimus."}
                  />
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredReviews.map((review, index) => (
                    <div
                      key={review.id}
                      className="p-8 hover:bg-white/[0.03] transition-all duration-300 group relative"
                      style={{
                        animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`
                      }}
                    >
                      {/* Quote decoration */}
                      <div className="absolute top-6 left-6 text-[#9333EA]/10 group-hover:text-[#9333EA]/20 transition-colors">
                        <Quote size={48} strokeWidth={2} />
                      </div>

                      <div className="flex items-start gap-6 relative">
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9333EA]/20 to-[#9333EA]/5 flex items-center justify-center border-2 border-[#9333EA]/20 group-hover:border-[#9333EA]/40 transition-all duration-300 shadow-lg shadow-[#9333EA]/5 group-hover:scale-105">
                          <span className="text-lg font-bold text-[#9333EA]">
                            {getInitials(review.name)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-lg font-bold text-white">
                                  {review.name}
                                </h3>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      className={`${
                                        i < review.rating
                                          ? 'text-amber-400 fill-amber-400'
                                          : 'text-white/15'
                                      } transition-colors`}
                                      strokeWidth={2.5}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="text-sm text-white/50">
                                  {new Date(review.created_at).toLocaleDateString('lt-LT', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                                {review.source && (
                                  <span className="text-xs px-2.5 py-1 bg-white/5 text-white/60 rounded-md border border-white/10 font-medium">
                                    {review.source}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                setSelectedReviewId(review.id);
                                setDeleteModalOpen(true);
                              }}
                              className="flex-shrink-0 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/20 group/delete"
                              aria-label="Ištrinti atsiliepimą"
                            >
                              <Trash2 size={20} strokeWidth={2.5} className="group-hover/delete:scale-110 transition-transform" />
                            </button>
                          </div>

                          {/* Comment */}
                          <p className="text-[15px] text-white/80 leading-relaxed mb-4 font-medium">
                            {review.review}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </AppShell.Page>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedReviewId(null);
        }}
        onConfirm={handleDelete}
        title="Ištrinti atsiliepimą"
        message="Ar tikrai norite ištrinti šį atsiliepimą? Šis veiksmas negrįžtamas ir atsiliepimas bus pašalintas visam laikui."
        confirmText={deleting ? "Trinamas..." : "Taip, ištrinti"}
        cancelText="Ne, palikti"
        variant="danger"
      />
    </AppShell>
  );
}
