import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Load gallery images from database
  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, image_url, alt_text, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading gallery images:', error);
        return;
      }

      if (data) {
        setImages(data);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total pages (each page shows 6 images in 2x3 grid)
  const IMAGES_PER_PAGE = 6;
  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);

  // Create pages with 6 images each
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    const pageImages = images.slice(i * IMAGES_PER_PAGE, (i + 1) * IMAGES_PER_PAGE);
    // Fill incomplete pages with empty slots for consistent layout
    while (pageImages.length < IMAGES_PER_PAGE) {
      pageImages.push({ id: `empty-${i}-${pageImages.length}`, image_url: '', alt_text: '', sort_order: 0 });
    }
    pages.push(pageImages);
  }

  // Navigate to specific page with smooth scroll
  const scrollToPage = (pageIndex: number) => {
    if (isScrollingRef.current || !scrollContainerRef.current) return;

    isScrollingRef.current = true;
    const container = scrollContainerRef.current;
    const targetScroll = pageIndex * container.clientWidth;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    setCurrentPage(pageIndex);

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);
  };

  // Handle previous page with infinite loop
  const handlePrevious = () => {
    const newPage = currentPage === 0 ? totalPages - 1 : currentPage - 1;
    scrollToPage(newPage);
  };

  // Handle next page with infinite loop
  const handleNext = () => {
    const newPage = currentPage === totalPages - 1 ? 0 : currentPage + 1;
    scrollToPage(newPage);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage !== null) {
        if (e.key === 'Escape') {
          setSelectedImage(null);
        } else if (e.key === 'ArrowLeft') {
          const prevIndex = selectedImage === 0 ? images.length - 1 : selectedImage - 1;
          setSelectedImage(prevIndex);
        } else if (e.key === 'ArrowRight') {
          const nextIndex = selectedImage === images.length - 1 ? 0 : selectedImage + 1;
          setSelectedImage(nextIndex);
        }
      } else {
        if (e.key === 'ArrowLeft') {
          handlePrevious();
        } else if (e.key === 'ArrowRight') {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentPage, totalPages, images.length]);

  // Handle scroll snap
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollLeft = container.scrollLeft;
      const pageWidth = container.clientWidth;
      const newPage = Math.round(scrollLeft / pageWidth);

      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  // Handle lightbox navigation
  const navigateLightbox = (direction: number) => {
    setSelectedImage((current) => {
      if (current === null) return null;
      const newIndex = (current + direction + images.length) % images.length;
      return newIndex;
    });
  };

  if (loading) {
    return (
      <section id="galerija" className="py-28 bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF] relative">
        <div className="absolute left-[4%] top-1/3 h-[100px] w-[1px] bg-gradient-to-b from-[#9333EA]/40 to-transparent hidden lg:block" />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-[60px] h-[2px] bg-[#9333EA]/60 mx-auto mb-4" />
            <h2 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight text-[#1A1A1A]/90 mb-2">
              Galerija
            </h2>
            <p className="text-[#3A3A3A]/70 italic text-base mt-2">
              Kirpimai, kurie kalba patys už save
            </p>
          </div>
          <div className="grid grid-cols-3 grid-rows-2 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-[18px] bg-gradient-to-br from-[#9333EA]/10 to-[#9333EA]/5 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section id="galerija" className="py-28 bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF] relative">
        <div className="absolute left-[4%] top-1/3 h-[100px] w-[1px] bg-gradient-to-b from-[#9333EA]/40 to-transparent hidden lg:block" />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-[60px] h-[2px] bg-[#9333EA]/60 mx-auto mb-4" />
            <h2 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight text-[#1A1A1A]/90 mb-2">
              Galerija
            </h2>
            <p className="text-[#3A3A3A]/70 italic text-base mt-2">
              Kirpimai, kurie kalba patys už save
            </p>
          </div>
          <div className="text-center text-[#3A3A3A]/60">
            Galerija šiuo metu tuščia
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="galerija" className="py-28 bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF] relative overflow-hidden">
      <div className="absolute left-[4%] top-1/3 h-[100px] w-[1px] bg-gradient-to-b from-[#9333EA]/40 to-transparent hidden lg:block" />

      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-[60px] h-[2px] bg-[#9333EA]/60 mx-auto mb-4" />
          <h2 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight text-[#1A1A1A]/90 mb-2">
            Galerija
          </h2>
          <p className="text-[#3A3A3A]/70 italic text-base mt-2">
            Kirpimai, kurie kalba patys už save
          </p>
        </div>

        {/* Gallery Container with Navigation */}
        <div className="relative max-w-7xl mx-auto">
          {/* Left Arrow */}
          {totalPages > 1 && (
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-30 bg-white/90 backdrop-blur-md rounded-full p-3 shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-[#9333EA]/30 text-[#9333EA] hover:bg-gradient-to-br hover:from-[#C084FC] hover:to-[#9333EA] hover:text-white hover:shadow-[0_8px_30px_rgba(147,51,234,0.4)] transition-all duration-300 active:scale-95"
              aria-label="Previous page"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
          )}

          {/* Right Arrow */}
          {totalPages > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-30 bg-white/90 backdrop-blur-md rounded-full p-3 shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-[#9333EA]/30 text-[#9333EA] hover:bg-gradient-to-br hover:from-[#C084FC] hover:to-[#9333EA] hover:text-white hover:shadow-[0_8px_30px_rgba(147,51,234,0.4)] transition-all duration-300 active:scale-95"
              aria-label="Next page"
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          )}

          {/* Scrollable Grid Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Pages Container - Each page is 100% width */}
            <div className="flex">
              {pages.map((pageImages, pageIndex) => (
                <div
                  key={pageIndex}
                  className="min-w-full snap-center px-2 sm:px-4"
                >
                  {/* 2x3 Grid (2 rows, 3 columns) */}
                  <div className="grid grid-cols-3 grid-rows-2 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
                    {pageImages.map((image, imageIndex) => {
                      const globalIndex = pageIndex * IMAGES_PER_PAGE + imageIndex;

                      // Empty slot for incomplete pages
                      if (!image.image_url) {
                        return (
                          <div
                            key={image.id}
                            className="aspect-square rounded-[18px] bg-gradient-to-br from-[#9333EA]/5 to-transparent opacity-0"
                          />
                        );
                      }

                      return (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImage(globalIndex)}
                          className="relative aspect-square rounded-[12px] sm:rounded-[18px] overflow-hidden border border-[#9333EA]/15 shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#9333EA]/35 cursor-pointer group bg-gradient-to-br from-[#9333EA]/10 to-[#9333EA]/5 transition-all duration-300 hover:scale-[1.02]"
                          aria-label={image.alt_text || `View image ${globalIndex + 1}`}
                        >
                          {/* Image */}
                          <img
                            src={image.image_url}
                            alt={image.alt_text}
                            loading="lazy"
                            width="800"
                            height="800"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#9333EA]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Expand Icon */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            <div className="bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                              <Maximize2 size={18} className="text-[#9333EA]" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page Indicators */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToPage(index)}
                  className={`transition-all duration-300 rounded-full ${
                    currentPage === index
                      ? 'w-8 h-2 bg-[#9333EA]'
                      : 'w-2 h-2 bg-[#9333EA]/30 hover:bg-[#9333EA]/50'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && images[selectedImage]?.image_url && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white transition-colors duration-200 z-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
            aria-label="Close"
          >
            <X size={32} strokeWidth={2} />
          </button>

          {/* Left Arrow */}
          <button
            className="absolute left-4 sm:left-6 text-white/70 hover:text-white transition-colors duration-200 z-50"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox(-1);
            }}
            aria-label="Previous image"
          >
            <ChevronLeft size={40} strokeWidth={2} />
          </button>

          {/* Right Arrow */}
          <button
            className="absolute right-4 sm:right-6 text-white/70 hover:text-white transition-colors duration-200 z-50"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox(1);
            }}
            aria-label="Next image"
          >
            <ChevronRight size={40} strokeWidth={2} />
          </button>

          {/* Image Container */}
          <div
            className="relative flex items-center justify-center max-w-[95vw] max-h-[90vh] w-auto h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImage]?.image_url}
              alt={images[selectedImage]?.alt_text}
              width="1200"
              height="1200"
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm tracking-wider">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  );
}
