import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Map = lazy(() => import('./Map'));

interface FooterProps {
  onReservationClick: () => void;
}

export default function Footer({ onReservationClick }: FooterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMapClick = () => {
    window.open('https://www.google.com/maps?q=Sukilėlių+pr.+72,+Kaunas,+50108', '_blank', 'noopener,noreferrer');
  };

  return (
    <footer
      ref={footerRef}
      id="kontaktai"
      className="bg-gradient-to-b from-[#1A0B2E] via-[#2A1548] to-[#0D0B1F] text-[#E9D5FF] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(147,51,234,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.05),transparent_60%)] pointer-events-none" />

      <div className="relative container mx-auto px-6 md:px-8 py-16 md:py-28">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
          }`}
        >
          <div className="space-y-8">
            <div>
              <div className="w-[50px] h-[2px] bg-gradient-to-r from-[#C084FC] via-[#9333EA] to-[#7E22CE] mb-5" />
              <h3 className="font-serif text-[32px] md:text-[36px] font-semibold text-[#F5F3EF] mb-8 tracking-tight leading-tight">
                Kontaktai
              </h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#9333EA]/10 to-[#7E22CE]/5 border border-[#9333EA]/25 flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-[#9333EA]/20 group-hover:to-[#A855F7]/15 group-hover:border-[#C084FC]/40 group-hover:shadow-[0_4px_16px_rgba(147,51,234,0.2)] transition-all duration-300">
                  <MapPin
                    size={18}
                    className="text-[#9333EA]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-[#D9D6CE]/60 text-xs uppercase tracking-widest mb-2 font-medium">
                    Adresas
                  </p>
                  <p className="text-[#F5F3EF] text-base font-medium leading-relaxed">
                    Sukilėlių pr. 72
                  </p>
                  <p className="text-[#D9D6CE]/70 text-sm mt-1">
                    Kaunas, 50108 Kauno m. sav.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#9333EA]/10 to-[#7E22CE]/5 border border-[#9333EA]/25 flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-[#9333EA]/20 group-hover:to-[#A855F7]/15 group-hover:border-[#C084FC]/40 group-hover:shadow-[0_4px_16px_rgba(147,51,234,0.2)] transition-all duration-300">
                  <Phone
                    size={18}
                    className="text-[#9333EA]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-[#D9D6CE]/60 text-xs uppercase tracking-widest mb-2 font-medium">
                    Telefonas
                  </p>
                  <a
                    href="tel:+37063172855"
                    className="text-[#F5F3EF] text-base font-medium leading-relaxed hover:text-[#9333EA] transition-colors duration-300 inline-block"
                    aria-label="Skambinti +370 631 72855"
                  >
                    +370 631 72855
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#9333EA]/10 to-[#7E22CE]/5 border border-[#9333EA]/25 flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-[#9333EA]/20 group-hover:to-[#A855F7]/15 group-hover:border-[#C084FC]/40 group-hover:shadow-[0_4px_16px_rgba(147,51,234,0.2)] transition-all duration-300">
                  <Mail
                    size={18}
                    className="text-[#9333EA]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-[#D9D6CE]/60 text-xs uppercase tracking-widest mb-2 font-medium">
                    El. paštas
                  </p>
                  <a
                    href="mailto:marius@hairhypejunior.lt?subject=Užklausa%20dėl%20kirpimo"
                    className="text-[#F5F3EF] text-base font-medium leading-relaxed hover:text-[#9333EA] transition-colors duration-300 inline-block break-all"
                    aria-label="Siųsti laišką marius@hairhypejunior.lt"
                  >
                    marius@hairhypejunior.lt
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#9333EA]/10 to-[#7E22CE]/5 border border-[#9333EA]/25 flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-[#9333EA]/20 group-hover:to-[#A855F7]/15 group-hover:border-[#C084FC]/40 group-hover:shadow-[0_4px_16px_rgba(147,51,234,0.2)] transition-all duration-300">
                  <Clock
                    size={18}
                    className="text-[#9333EA]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-[#D9D6CE]/60 text-xs uppercase tracking-widest mb-2 font-medium">
                    Darbo laikas
                  </p>
                  <p className="text-[#F5F3EF] text-base font-medium leading-relaxed">
                    Kasdien 15:00–20:00
                  </p>
                </div>
              </div>

              <button
                onClick={onReservationClick}
                className="w-full sm:w-auto mt-8 bg-gradient-to-r from-[#7E22CE] via-[#9333EA] to-[#A855F7] text-white px-8 py-3.5 rounded-lg border border-[#C084FC]/30 shadow-[0_8px_24px_rgba(147,51,234,0.3),0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(147,51,234,0.5),0_0_32px_rgba(147,51,234,0.3)] hover:-translate-y-[3px] hover:scale-105 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] font-semibold text-base touch-manipulation"
              >
                Rezervuoti vizitą
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="w-[50px] h-[2px] bg-gradient-to-r from-[#C084FC] via-[#9333EA] to-[#7E22CE] mb-5" />
              <h3 className="font-serif text-[32px] md:text-[36px] font-semibold text-[#F5F3EF] mb-8 tracking-tight leading-tight">
                Žemėlapis
              </h3>
            </div>

            <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden border border-[#9333EA]/30 shadow-[0_0_40px_rgba(147,51,234,0.15),0_0_20px_rgba(147,51,234,0.1)]">
              <Suspense fallback={
                <div className="w-full h-full bg-gradient-to-br from-[#1A0B2E] via-[#2A1548] to-[#0D0B1F] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#9333EA]/30 border-t-[#C084FC] animate-spin" />
                </div>
              }>
                <Map />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#2E2E2E]/70 to-transparent mb-10" />

        <div
          className={`flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'
          }`}
        >
          <p className="text-[#D9D6CE]/50 text-sm tracking-wide text-center md:text-left">
            © 2025 Hair Hype Junior, Kaunas. Visos teisės saugomos.
          </p>

          <div className="flex items-center gap-6 md:gap-8">
            <Link
              to="/privatumas"
              className="text-[#D9D6CE]/60 hover:text-[#9333EA] text-sm tracking-wide transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#B58E4C]/50 focus:ring-offset-2 focus:ring-offset-[#0C0C0C] rounded px-2 py-1"
              aria-label="Privatumo politika"
            >
              Privatumas
            </Link>

            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/hair_hype_junior/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/15 hover:border-[var(--accent)]/40 hover:shadow-[0_0_20px_rgba(106,70,240,0.3)] transition-all duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-500)] focus-visible:outline-offset-2"
                aria-label="Instagram profilis"
              >
                <Instagram size={18} strokeWidth={2} />
                <span className="hidden md:inline text-sm font-medium">Instagram</span>
              </a>

              <a
                href="https://www.tiktok.com/@hair_hype_junior"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--accent)]/5 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/40 hover:shadow-[0_0_20px_rgba(106,70,240,0.3)] transition-all duration-300 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-500)] focus-visible:outline-offset-2"
                aria-label="TikTok profilis"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
