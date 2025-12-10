import { useState, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ServicesProps {
  onReservationClick?: () => void;
}

interface Service {
  id: string;
  name: string;
  price_eur: number;
  duration_min: number;
  description: string;
  is_active: boolean;
  sort_order: number;
  slug: string;
}

export default function Services({ onReservationClick }: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) {
        setServices(data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceBenefit = (slug: string): string => {
    const benefits: Record<string, string> = {
      'vyriskas-kirpimas': 'Pritaikytas veido formai',
      'kirpimas-barzda': 'Profesionaliems susitikimams',
      'ilgu-plauku-kirpimas': 'Patogiai kasdienybei',
      'barzdos-tvarkymas': 'Solidžiam pirmam įspūdžiui',
    };
    return benefits[slug] || 'Profesionali priežiūra';
  };

  const isFeatured = (slug: string): boolean => {
    return slug === 'kirpimas-barzda';
  };

  if (loading) {
    return (
      <section
        id="paslaugos"
        className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-b from-[#F9F7F3] to-[#F3EEE7] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-10 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1a1a1a] tracking-tight leading-[1.1]">
            Paslaugos ir kainos
          </h2>
          <div className="mt-12 md:mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/50 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="paslaugos"
      className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF] overflow-hidden after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.08),transparent_70%)] after:pointer-events-none"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-10 text-center relative z-10">

        {/* Soft purple bloom behind title */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[480px] h-[180px] bg-[#9333EA]/25 blur-3xl opacity-40 rounded-full pointer-events-none" />

        {/* Title & Subtitle */}
        <div className="relative z-10 opacity-0 translate-y-8 animate-[fadeInUp_0.9s_cubic-bezier(0.19,1,0.22,1)_200ms_forwards]">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1a1a1a] tracking-tight leading-[1.1]">
            Paslaugos ir kainos
          </h2>
          <div className="mx-auto mt-3 md:mt-4 h-[2px] w-[48px] bg-gradient-to-r from-transparent via-[#9333EA]/50 to-transparent rounded-full" />
          <p className="mt-3 md:mt-4 text-[#3d3d3d]/70 text-base md:text-lg lg:text-xl font-light max-w-2xl mx-auto px-4">
            Paslaugos, pritaikytos tavo stiliui ir veido bruožams
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="mt-12 md:mt-16 lg:mt-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8 relative z-10">

          {services.map((service, index) => {
            const featured = isFeatured(service.slug);
            const benefit = getServiceBenefit(service.slug);

            return (
              <article
                key={service.id}
                className="service-card relative overflow-visible rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#FAF5FF] via-[#FFFFFF] to-[#F3E8FF] border border-[#9333EA]/20 shadow-[0_8px_24px_rgba(147,51,234,0.08),0_4px_16px_rgba(0,0,0,0.04)] p-6 md:p-8 pt-10 md:pt-12 text-left transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[8px] hover:border-[#9333EA]/40 hover:shadow-[0_24px_60px_rgba(147,51,234,0.15),0_8px_32px_rgba(147,51,234,0.12),0_0_40px_rgba(147,51,234,0.1)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#9333EA]/5 before:via-transparent before:to-[#A855F7]/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700 before:pointer-events-none before:rounded-3xl after:absolute after:inset-0 after:rounded-3xl after:shadow-[inset_0_1px_2px_rgba(147,51,234,0.1),inset_0_-1px_1px_rgba(255,255,255,0.5)] after:pointer-events-none opacity-0 translate-y-5 animate-[fadeInUp_0.6s_cubic-bezier(0.19,1,0.22,1)_forwards] group"
                style={{
                  animationDelay: `${400 + index * 120}ms`
                }}
                aria-label={`${service.name} - ${service.price_eur} eurų`}
              >
                {/* Populiariausia Badge */}
                {featured && (
                  <div className="absolute top-2 left-1/2 md:left-5 -translate-x-1/2 md:translate-x-0 z-[60] bg-gradient-to-r from-[#C084FC] to-[#9333EA] rounded-full text-[10px] md:text-[11px] tracking-[0.1em] uppercase font-bold px-4 py-[5px] shadow-[0_4px_16px_rgba(147,51,234,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] transform opacity-0 translate-y-2 animate-[fadeInUp_0.5s_cubic-bezier(0.19,1,0.22,1)_600ms_forwards] group-hover:shadow-[0_6px_20px_rgba(147,51,234,0.5)]">
                    <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                      Populiariausia
                    </span>
                  </div>
                )}

                {/* Service Title */}
                <h3 className="relative z-10 font-serif text-[22px] font-semibold text-[#1a1a1a] mb-2 transition-all duration-700 group-hover:font-bold">
                  {service.name}
                </h3>

                {/* Price */}
                <div className="relative z-10 flex items-baseline gap-1 mb-2 group-hover:animate-[subtlePulse_2s_ease-in-out_infinite]">
                  <span className="text-[32px] font-bold bg-gradient-to-br from-[#7E22CE] via-[#9333EA] to-[#A855F7] bg-clip-text text-transparent leading-none tracking-tight">
                    {Math.floor(service.price_eur)}
                  </span>
                  <span className="text-[16px] align-super ml-[2px] opacity-80 bg-gradient-to-br from-[#7E22CE] via-[#9333EA] to-[#A855F7] bg-clip-text text-transparent font-semibold">
                    €
                  </span>
                </div>

                {/* Time Tag */}
                <div className="relative z-10 inline-flex items-center gap-1 bg-gradient-to-r from-[#F3E8FF] to-[#E9D5FF] text-[#6B21A8] rounded-full px-3 py-1 text-[13px] font-medium mt-1 border border-[#9333EA]/10">
                  <Clock size={14} aria-hidden="true" strokeWidth={2} className="text-[#9333EA]" />
                  <span>{service.duration_min} min</span>
                </div>

                {/* Description */}
                <p className="relative z-10 text-[#4c4c4c]/85 text-[15px] leading-relaxed mt-4 tracking-[0.01em]">
                  {service.description}
                </p>

                {/* Benefit Checkpoint */}
                <div className="relative z-10 flex items-center gap-2 text-[#9333EA] text-[14px] mt-3">
                  <Check size={16} aria-hidden="true" strokeWidth={2.5} />
                  <span>{benefit}</span>
                </div>
              </article>
            );
          })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-14 opacity-0 translate-y-4 animate-[fadeInUp_0.6s_cubic-bezier(0.19,1,0.22,1)_880ms_forwards]">
          <div className="inline-block">
            <button
              onClick={onReservationClick}
              className="relative inline-block bg-gradient-to-br from-[#7E22CE] via-[#9333EA] to-[#6B21A8] text-white font-bold tracking-wide text-[16px] rounded-xl px-12 py-4 shadow-[0_8px_24px_rgba(147,51,234,0.3),0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(147,51,234,0.5),0_0_32px_rgba(147,51,234,0.3)] hover:-translate-y-[3px] hover:scale-105 transition-all duration-400 ease-out focus:outline-none focus:ring-2 focus:ring-[#C084FC] focus:ring-offset-2 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700"
            >
              <span className="relative z-10">Rezervuoti vizitą</span>
            </button>
            <div className="block mx-auto mt-6 w-[180px] h-[1px] bg-gradient-to-r from-transparent via-[#9333EA]/25 to-transparent animate-[shimmerGlow_6s_infinite_linear]" />
          </div>
        </div>
      </div>
    </section>
  );
}
