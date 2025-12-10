import { useState, useEffect, useRef } from 'react';
import { Star, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewService, type Review, type ReviewStats } from '../lib/services/reviewService';

export default function Reviews() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ average_rating: 5.0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    review: '',
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadReviews();
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canScrollLeft) {
        e.preventDefault();
        scroll('left');
      } else if (e.key === 'ArrowRight' && canScrollRight) {
        e.preventDefault();
        scroll('right');
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [canScrollLeft, canScrollRight]);

  useEffect(() => {
    const checkScrollability = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

        // Calculate scroll progress (0 to 1)
        const maxScroll = scrollWidth - clientWidth;
        const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
        setScrollProgress(progress);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      checkScrollability();
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);

      // Touch gesture support for smooth drag scrolling
      let touchStartX = 0;
      let isDragging = false;
      let startScrollLeft = 0;

      const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX;
        startScrollLeft = container.scrollLeft;
        isDragging = true;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = touchStartX - currentX;
        container.scrollLeft = startScrollLeft + diff;
      };

      const handleTouchEnd = () => {
        isDragging = false;
        // CSS snap scrolling will handle the snapping automatically
        // No manual calculation needed with scroll-snap-type
      };

      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [allReviews]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      const targetScroll = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const loadReviews = async () => {
    try {
      const [reviewStats, allReviewsData] = await Promise.all([
        reviewService.getReviewStats(),
        getAllReviews()
      ]);

      setAllReviews(allReviewsData);
      setStats(reviewStats);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllReviews = async (): Promise<Review[]> => {
    const { data, error } = await (await import('../lib/supabase')).supabase
      .from('reviews')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return data || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await reviewService.submitReview(
        formData.name,
        formData.rating,
        formData.review
      );

      if (success) {
        setIsModalOpen(false);
        setFormData({ name: '', rating: 5, review: '' });
        setShowToast(true);

        setTimeout(() => setShowToast(false), 5000);

        loadReviews();
      } else {
        alert('Klaida pateikiant atsiliepimą. Bandykite dar kartą.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Klaida pateikiant atsiliepimą. Bandykite dar kartą.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReviewCard = (review: Review) => (
    <div
      key={review.id}
      className="w-[280px] sm:w-[340px] h-[200px] sm:h-auto bg-gradient-to-br from-white via-[#FAF5FF]/95 to-[#F3E8FF]/90 backdrop-blur-sm border border-[#9333EA]/20 rounded-[18px] p-5 sm:p-6 shadow-[0_8px_24px_rgba(147,51,234,0.08),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(147,51,234,0.15),0_8px_24px_rgba(147,51,234,0.1)] sm:hover:-translate-y-2 hover:border-[#9333EA]/35 transition-all duration-500 ease-out flex flex-col"
    >
      <div className="flex items-start gap-3 sm:gap-3.5 mb-3 sm:mb-4 flex-shrink-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#C084FC]/30 via-[#9333EA]/25 to-[#7E22CE]/20 flex items-center justify-center font-serif font-semibold text-[#6B21A8] text-base sm:text-lg border border-[#9333EA]/30 flex-shrink-0 shadow-[0_2px_8px_rgba(147,51,234,0.15)]">
          {review.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#1A1A1A]/90 text-sm sm:text-base mb-1.5 truncate">{review.name}</p>
          <div className="flex gap-0.5">
            {[...Array(review.rating)].map((_, i) => (
              <Star key={i} size={12} fill="url(#purpleGradient)" className="text-[#9333EA] sm:w-[13px] sm:h-[13px]" />
            ))}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#C084FC', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#9333EA', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#7E22CE', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#9333EA]/20 to-transparent mb-3 sm:mb-4 flex-shrink-0" />
      <p className="text-[#2B2B2B]/75 text-sm sm:text-[15px] leading-[1.65] sm:leading-[1.7] tracking-wide line-clamp-4 overflow-hidden">
        {review.review}
      </p>
    </div>
  );

  if (loading) {
    return (
      <section
        ref={sectionRef}
        id="atsiliepimai"
        className="py-28 bg-gradient-to-b from-[#F7F5F2] via-[#F3EFE9] to-[#ECE7E2] overflow-hidden shadow-[inset_0_40px_80px_-40px_rgba(0,0,0,0.05)]"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="w-[60px] h-[2px] bg-[#B58E4C]/60 mx-auto mb-4 animate-pulse" />
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1A1A1A]/90 mb-3">
              Klientų atsiliepimai
            </h2>
            <p className="text-[#3A3A3A]/70 text-lg italic">Kraunama...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="atsiliepimai"
      className="py-28 bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF] overflow-hidden shadow-[inset_0_40px_80px_-40px_rgba(147,51,234,0.08)]"
    >
      <div className="container mx-auto px-4 lg:px-8 mb-12 sm:mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`w-[50px] sm:w-[60px] h-[2px] bg-gradient-to-r from-[#C084FC] via-[#9333EA] to-[#7E22CE] mx-auto mb-3 sm:mb-4 transition-all duration-1000 ${
              isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
          />

          <h2
            className={`font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1A1A1A]/90 leading-[1.1] mb-2 sm:mb-3 px-4 transition-all duration-1000 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'
            }`}
            style={{ textShadow: '0 0 8px rgba(147,51,234,0.15)' }}
          >
            Klientų atsiliepimai
          </h2>

          <p
            className={`text-[#3A3A3A]/70 text-base sm:text-lg italic tracking-wide text-center max-w-[560px] mx-auto mb-6 sm:mb-8 px-4 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'
            }`}
          >
            Pasitikėjimas ir kokybė – tai, kas mūsų klientai vertina labiausiai
          </p>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 mb-6 sm:mb-8 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-br from-white to-[#FAF5FF]/80 backdrop-blur-sm border border-[#9333EA]/25 shadow-[0_4px_16px_rgba(147,51,234,0.1)]">
              <Star size={15} fill="#9333EA" className="text-[#9333EA] sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[#1A1A1A]/90 text-sm font-medium whitespace-nowrap">
                {(stats.average_rating || 0).toFixed(1)}/5
              </span>
              <span className="text-[#3A3A3A]/50 text-xs whitespace-nowrap">
                ({stats.total_reviews || 0} {stats.total_reviews === 1 ? 'atsiliepimas' : stats.total_reviews === 0 ? 'atsiliepimų' : 'atsiliepimai'})
              </span>
            </div>

            <div className="w-[1px] h-4 bg-[#B58E4C]/20 hidden sm:block" />

            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-br from-white to-[#FAF5FF]/80 backdrop-blur-sm border border-[#9333EA]/25 shadow-[0_4px_16px_rgba(147,51,234,0.1)]">
              <Star size={15} fill="#9333EA" className="text-[#9333EA] sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[#1A1A1A]/90 text-sm font-medium whitespace-nowrap">
                Treatwell 4.9
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className={`inline-flex items-center gap-2 bg-gradient-to-r from-[#7E22CE] via-[#9333EA] to-[#A855F7] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg hover:shadow-[0_8px_24px_rgba(147,51,234,0.4),0_0_16px_rgba(147,51,234,0.2)] transition-all duration-300 font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_16px_rgba(147,51,234,0.25)] hover:-translate-y-1 hover:scale-105 active:scale-95 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'
            }`}
            style={{ transitionDelay: isVisible ? '400ms' : '0ms' }}
          >
            Palikti atsiliepimą
          </button>
        </div>
      </div>

      {allReviews.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#3A3A3A]/60 text-lg italic">
            Kol kas atsiliepimų nėra – būk pirmas!
          </p>
        </div>
      ) : (
        <div className="relative w-full max-w-7xl mx-auto px-4 lg:px-8">
          {/* Navigation Buttons */}
          {allReviews.length > 2 && (
            <>
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-white to-[#FAF5FF] backdrop-blur-sm border border-[#9333EA]/25 shadow-[0_4px_20px_rgba(147,51,234,0.12)] flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-br hover:from-[#9333EA] hover:to-[#7E22CE] hover:border-[#C084FC] hover:shadow-[0_8px_28px_rgba(147,51,234,0.35)] group ${
                  canScrollLeft
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4 pointer-events-none'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft
                  size={24}
                  className="text-[#1A1A1A]/70 group-hover:text-white transition-colors duration-300"
                  strokeWidth={2}
                />
              </button>

              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-white to-[#FAF5FF] backdrop-blur-sm border border-[#9333EA]/25 shadow-[0_4px_20px_rgba(147,51,234,0.12)] flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-br hover:from-[#9333EA] hover:to-[#7E22CE] hover:border-[#C084FC] hover:shadow-[0_8px_28px_rgba(147,51,234,0.35)] group ${
                  canScrollRight
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-4 pointer-events-none'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight
                  size={24}
                  className="text-[#1A1A1A]/70 group-hover:text-white transition-colors duration-300"
                  strokeWidth={2}
                />
              </button>
            </>
          )}

          {/* Scrollable Reviews Container with Fade Edges */}
          <div className="relative">
            {/* Left Fade Gradient */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#F3E8FF] to-transparent z-[5] pointer-events-none" />
            )}

            {/* Right Fade Gradient */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F3E8FF] to-transparent z-[5] pointer-events-none" />
            )}

            <div
              ref={scrollContainerRef}
              className="overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="flex gap-4 sm:gap-5 py-4 px-4 sm:px-2 review-cards-wrapper">
                {allReviews.map((review, index) => (
                  <div
                    key={review.id}
                    className={`flex-shrink-0 snap-center ${
                      index === 0 ? 'first-card' : ''
                    } ${
                      index === allReviews.length - 1 ? 'last-card' : ''
                    }`}
                  >
                    {renderReviewCard(review)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll Progress Bar */}
          {allReviews.length > 2 && (
            <div className="flex justify-center mt-8">
              <div className="w-48 h-1 bg-[#E9D5FF]/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7E22CE] via-[#9333EA] to-[#C084FC] rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(147,51,234,0.4)]"
                  style={{
                    width: `${Math.max(15, scrollProgress * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-gradient-to-b from-white to-[#FAF8F5] rounded-[20px] max-w-md w-full p-8 relative shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[#9333EA]/20 animate-[scaleIn_0.3s_cubic-bezier(0.19,1,0.22,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#1A1A1A]/40 hover:text-[#9333EA] transition-colors duration-300"
            >
              <X size={22} strokeWidth={1.5} />
            </button>

            <div className="w-[50px] h-[2px] bg-gradient-to-r from-[#C084FC] via-[#9333EA] to-[#7E22CE] mb-4" />
            <h3 className="font-serif text-3xl font-semibold text-[#1A1A1A]/90 mb-8 leading-tight">
              Palikti atsiliepimą
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A]/80 mb-2 tracking-wide">
                  Vardas
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-[#9333EA]/25 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9333EA]/40 focus:border-[#C084FC]/60 bg-white/50 transition-all duration-300"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A]/80 mb-3 tracking-wide">
                  Reitingas
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-all duration-300 hover:scale-110"
                      disabled={isSubmitting}
                    >
                      <Star
                        size={30}
                        fill={star <= formData.rating ? '#9333EA' : 'none'}
                        className={star <= formData.rating ? 'text-[#9333EA]' : 'text-[#1A1A1A]/20'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A]/80 mb-2 tracking-wide">
                  Atsiliepimas
                </label>
                <textarea
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-[#9333EA]/25 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9333EA]/40 focus:border-[#C084FC]/60 bg-white/50 resize-none transition-all duration-300"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#7E22CE] via-[#9333EA] to-[#A855F7] text-white px-6 py-3.5 rounded-lg hover:shadow-[0_8px_24px_rgba(147,51,234,0.4),0_0_16px_rgba(147,51,234,0.2)] transition-all duration-300 font-semibold text-sm uppercase tracking-wider shadow-[0_4px_16px_rgba(147,51,234,0.25)] hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
              >
                {isSubmitting ? 'Siunčiama...' : 'Pateikti'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-8 right-8 bg-white border border-[#9333EA]/30 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] p-4 flex items-center gap-3 z-50 animate-[slideInRight_0.4s_cubic-bezier(0.19,1,0.22,1)]">
          <div className="w-8 h-8 rounded-full bg-[#B58E4C]/10 flex items-center justify-center">
            <Check size={18} className="text-[#9333EA]" />
          </div>
          <div>
            <p className="font-medium text-[#1A1A1A]/90 text-sm">Ačiū!</p>
            <p className="text-[#3A3A3A]/70 text-xs">
              Tavo atsiliepimas sėkmingai paskelbtas
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Hide scrollbar while maintaining functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Smooth scroll behavior */
        @media (prefers-reduced-motion: no-preference) {
          .scroll-smooth {
            scroll-behavior: smooth;
          }
        }

        /* Mobile-specific snap scrolling improvements */
        @media (max-width: 639px) {
          .snap-x {
            scroll-snap-type: x mandatory;
            scroll-padding: 0 calc(50vw - 140px);
          }

          .snap-center {
            scroll-snap-align: center;
            scroll-snap-stop: always;
          }

          /* Add padding to first and last cards to center them */
          .review-cards-wrapper .first-card {
            margin-left: calc(50vw - 140px - 1rem); /* 50vw - half card width - gap */
          }

          .review-cards-wrapper .last-card {
            margin-right: calc(50vw - 140px - 1rem); /* 50vw - half card width - gap */
          }

          /* Ensure consistent review card sizing on mobile */
          .snap-center > div {
            min-height: 200px;
            max-height: 200px;
          }
        }

        /* Desktop maintains flexible height */
        @media (min-width: 640px) {
          .snap-x {
            scroll-snap-type: x proximity;
          }

          .snap-center {
            scroll-snap-align: start;
          }
        }
      `}</style>
    </section>
  );
}
