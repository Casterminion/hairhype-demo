interface HeroProps {
  onReservationClick: () => void;
}

export default function Hero({ onReservationClick }: HeroProps) {
  return (
    <section id="pradzia" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Responsive Hero Background with Picture Element */}
      <picture>
        <source
          media="(min-width: 768px)"
          srcSet="/assets/headerimglaptop.webp"
          width="1920"
          height="1080"
        />
        <source
          media="(max-width: 767px)"
          srcSet="/assets/mobileheaderimg.webp"
          width="768"
          height="1024"
        />
        <img
          src="/assets/mobileheaderimg.webp"
          alt="Profesionalus barberis Kaune atliekantis vyriškų kirpimų paslaugas - Hair Hype Junior"
          className="absolute inset-0 w-full h-full object-cover object-center"
          width="1920"
          height="1080"
          fetchpriority="high"
          loading="eager"
          decoding="async"
        />
      </picture>

      <div className="absolute inset-0 bg-gradient-to-b from-[#1A0B2E]/80 via-[#1A0B2E]/50 to-[#1A0B2E]/90"></div>

      {/* Purple gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.22),transparent_65%)] pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-8 lg:px-8 relative z-10 text-center pb-20 md:pb-32" style={{ paddingTop: 'clamp(56px, 8vw, 96px)' }}>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-black mb-4 md:mb-6 leading-tight tracking-tight opacity-0 animate-[fadeInUp_0.8s_cubic-bezier(0.19,1,0.22,1)_0ms_forwards]">
          <span
            className="text-shimmer inline-block font-black"
            style={{ textShadow: '0 3px 25px rgba(0,0,0,0.6)' }}
          >
            Hair Hype Junior – barberis ir kirpėjas Kaune
          </span>
        </h1>

        <p className="text-base md:text-lg lg:text-xl text-[#EDEAE6]/90 tracking-wide leading-relaxed mb-6 md:mb-8 max-w-3xl mx-auto font-light px-4 opacity-0 animate-[fadeInUp_0.8s_cubic-bezier(0.19,1,0.22,1)_150ms_forwards]">
          Profesionalūs fade kirpimai, skin fade, išskutinėjimai, barzdos formavimas ir skutimas – jūsų stiliui Kaune
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5 mb-10 opacity-0 animate-[fadeInUp_0.8s_cubic-bezier(0.19,1,0.22,1)_300ms_forwards] px-4">
          <button
            onClick={onReservationClick}
            className="w-full sm:w-auto bg-[var(--accent)] text-white px-6 md:px-10 py-[14px] md:py-4 rounded-[var(--radius)] font-[650] text-base md:text-lg tracking-[0.01em] shadow-[0_10px_30px_rgba(147,51,234,0.4)] hover:shadow-[0_12px_36px_rgba(147,51,234,0.5)] hover:-translate-y-[1px] hover:saturate-[1.05] active:scale-[0.98] transition-all duration-300 ease-out touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-500)] focus-visible:outline-offset-2"
          >
            Rezervuoti vizitą
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-0 opacity-0 animate-[fadeInUp_0.8s_cubic-bezier(0.19,1,0.22,1)_600ms_forwards]">
          
        </div>
      </div>
    </section>
  );
}
