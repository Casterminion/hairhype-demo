import { useState, useEffect } from 'react';
import { Menu, X, Instagram } from 'lucide-react';

interface HeaderProps {
  isHidden?: boolean;
}

export default function Header({ isHidden = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 20);

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      }

      // Always show at the very top
      if (currentScrollY < 20) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToCenteredSection = (element: Element) => {
    const viewportHeight = window.innerHeight;

    // Get the section's position and dimensions
    const sectionRect = element.getBoundingClientRect();
    const sectionTop = window.pageYOffset + sectionRect.top;
    const sectionHeight = sectionRect.height;

    // Find the heading within the section (h1, h2, or h3)
    const heading = element.querySelector('h1, h2, h3');
    let targetScrollPosition;

    if (heading) {
      // If there's a heading, position it nicely below the navbar
      const headingRect = heading.getBoundingClientRect();
      const headingTop = window.pageYOffset + headingRect.top;
      const desiredTopPadding = 140; // Space from top to show heading nicely

      targetScrollPosition = headingTop - desiredTopPadding;
    } else {
      // Fallback: center the section with padding
      const topPadding = 120;

      if (sectionHeight > viewportHeight - topPadding) {
        // Large section: show from top with padding
        targetScrollPosition = sectionTop - topPadding;
      } else {
        // Small section: try to center it
        targetScrollPosition = sectionTop - (viewportHeight - sectionHeight) / 2;
      }
    }

    // Ensure we don't scroll past the beginning of the document
    targetScrollPosition = Math.max(0, targetScrollPosition);

    window.scrollTo({
      top: targetScrollPosition,
      behavior: 'smooth'
    });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // First, navigate to home if we're on a blog post
    const currentHash = window.location.hash;
    const isOnBlogPost = currentHash.startsWith('#tinklarastis/');

    if (href === '#' || href === '#pradzia') {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (isOnBlogPost) {
        // Navigate back to home first
        window.location.hash = '';
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            scrollToCenteredSection(element);
          }
        }, 300);
      } else {
        // Already on home page, just scroll
        const element = document.querySelector(href);
        if (element) {
          scrollToCenteredSection(element);
        }
      }
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Pradžia', href: '#pradzia' },
    { label: 'Apie', href: '#apie' },
    { label: 'Kainoraštis', href: '#paslaugos' },
    { label: 'Galerija', href: '#galerija' },
    { label: 'Tinklaraštis', href: '#tinklarastis' },
    { label: 'Atsiliepimai', href: '#atsiliepimai' },
    { label: 'Kontaktai', href: '#kontaktai' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-300 ease-in-out ${
          isHidden || !isVisible ? '-translate-y-full' : 'translate-y-0'
        } ${
          isScrolled
            ? 'bg-white/98 backdrop-blur-md py-4 border-b border-gray-200/80 shadow-sm'
            : 'bg-white/95 backdrop-blur-md py-6 border-b border-gray-100/50'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="font-serif text-2xl font-bold text-gray-900 tracking-tight">
              Hair Hype Junior
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-gray-700 hover:text-gray-900 transition-all duration-[400ms] text-sm font-medium tracking-wide relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gray-900 after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="https://www.instagram.com/hair_hype_junior/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-[18px] py-3 rounded-full bg-gray-900 text-white text-sm font-[650] tracking-wide shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-gray-800 hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                aria-label="Instagram profilis"
              >
                <Instagram size={16} strokeWidth={2.5} />
                <span>Instagram</span>
              </a>
            </nav>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[72px] bg-white z-[9999] border-t border-gray-200">
          <nav className="container mx-auto px-4 py-8 flex flex-col gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-gray-700 text-lg font-medium hover:text-gray-900 transition-colors duration-200 py-2 border-b border-gray-100 last:border-0"
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://www.instagram.com/hair_hype_junior/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white text-base font-[650] tracking-wide shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-gray-800 active:scale-95 transition-all duration-300 mt-4"
              aria-label="Instagram profilis"
            >
              <Instagram size={18} strokeWidth={2.5} />
              <span>Instagram</span>
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
