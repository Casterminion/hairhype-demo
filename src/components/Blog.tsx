import { FileText, ArrowRight, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { blogService } from '../lib/services/blogService';
import type { PostWithStats } from '../lib/types/blog';

interface BlogProps {
  onNavigate: (slug: string) => void;
}

export default function Blog({ onNavigate }: BlogProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [posts, setPosts] = useState<PostWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  // Observe section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await blogService.getAllPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  // Responsive slides count
  const getVisiblePosts = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
    }
    return 1;
  };

  const [visiblePosts, setVisiblePosts] = useState(getVisiblePosts());
  useEffect(() => {
    const handleResize = () => setVisiblePosts(getVisiblePosts());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation
  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) =>
      prev === 0 ? posts.length - visiblePosts : prev - 1
    );
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) =>
      prev >= posts.length - visiblePosts ? 0 : prev + 1
    );
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < posts.length - visiblePosts;

  return (
    <section
      ref={sectionRef}
      id="tinklarastis"
      className="py-28 bg-gradient-to-b from-white via-gray-50 to-gray-100 overflow-hidden"
    >
      <div className="container mx-auto px-4 lg:px-8 max-w-full overflow-visible">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`w-[60px] h-[2px] bg-gray-900 mx-auto mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
          />
          <h2
            className={`font-serif text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 leading-[1.1] transition-all duration-900 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            Tinklaraštis
          </h2>
          <p
            className={`text-gray-600 italic text-base mt-2 text-center max-w-[480px] mx-auto transition-all duration-900 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            Įžvalgos, stiliaus ir plaukų sveikatos patarimai
          </p>
        </div>

        {/* States */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Kol kas nėra įrašų</p>
          </div>
        ) : (
          <div className="relative w-full max-w-full overflow-visible">
            {/* Navigation Buttons */}
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={`absolute left-0 sm:left-2 lg:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm hover:bg-gray-900 text-gray-900 hover:text-white rounded-full p-2.5 lg:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed`}
              aria-label="Previous blog post"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`absolute right-0 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm hover:bg-gray-900 text-gray-900 hover:text-white rounded-full p-2.5 lg:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed`}
              aria-label="Next blog post"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>

            {/* Carousel Track */}
            <div className="overflow-x-hidden w-full relative">
              <div
                className="flex transition-transform duration-[600ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
                style={{
                  transform: `translateX(-${currentIndex * (100 / visiblePosts)}%)`,
                }}
              >
                {posts.map((post, index) => (
                  <article
                    key={index}
                    className={`group relative rounded-[20px] overflow-hidden border border-gray-200 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.08)] hover:-translate-y-[6px] hover:shadow-[0_14px_34px_rgba(0,0,0,0.12)] hover:border-gray-300 transition-all duration-[600ms] ease-[cubic-bezier(0.19,1,0.22,1)] flex-shrink-0 cursor-pointer flex flex-col`}
                    style={{
                      flex: `0 0 ${100 / visiblePosts}%`,
                      maxWidth: `${100 / visiblePosts}%`,
                      transitionDelay: isVisible ? `${300 + index * 100}ms` : '0ms',
                    }}
                    onClick={() => onNavigate(post.slug)}
                  >
                    {post.featured && (
                      <div className="absolute top-4 left-4 bg-gray-900 text-white text-[11px] uppercase tracking-wider px-2 py-[2px] rounded-full shadow-sm z-10 font-medium">
                        Rekomenduojamas
                      </div>
                    )}

                    <div className="aspect-[16/9] relative overflow-hidden group-hover:brightness-105 transition-all duration-500 bg-gray-100 flex-shrink-0">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        width="800"
                        height="450"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/img1.webp';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent pointer-events-none" />
                    </div>

                    <div className="p-4 md:p-6 lg:p-8 flex flex-col flex-grow">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags && post.tags.length > 0 && post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-4 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold tracking-widest uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-serif text-[18px] md:text-[20px] leading-tight font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 text-[14px] md:text-[15px] leading-relaxed mt-3 line-clamp-3 min-h-[4.5rem]">
                        {post.excerpt}
                      </p>

                      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4 w-full" />

                      <div className="flex items-center justify-between w-full mt-auto">
                        <button className="inline-flex items-center gap-1 text-gray-900 hover:text-gray-700 font-semibold text-[13px] md:text-[14px] uppercase tracking-wide transition-all duration-300 whitespace-nowrap">
                          Skaityti
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-[4px] transition-transform duration-300"
                          />
                        </button>
                        <div className="flex items-center gap-1 text-gray-500 text-sm flex-shrink-0">
                          <Heart size={16} className="text-gray-400" />
                          <span>{post.like_count}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: posts.length - visiblePosts + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true);
                      setCurrentIndex(index);
                      setTimeout(() => setIsTransitioning(false), 600);
                    }
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? 'w-8 bg-gray-900'
                      : 'w-2 bg-gray-300 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
