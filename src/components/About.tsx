import { Scissors, Star, Award, Play, AlertCircle } from 'lucide-react';
import { useRef, useState } from 'react';

export default function About() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const features = [
    { icon: Scissors, label: 'Fade kirpimai' },
    { icon: Star, label: 'Barzdos priežiūra' },
    { icon: Award, label: 'Premium kokybė' },
  ];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          setHasError(true);
        });
      }
    }
  };

  const handleVideoError = () => {
    setHasError(true);
  };

  return (
    <section
      id="apie"
      className="relative py-24 lg:py-32 bg-gradient-to-b from-[#F9F7F3] via-[#F1EDE8] to-[#F9F7F3] overflow-hidden"
      style={{
        boxShadow: 'inset 0 0 200px rgba(0,0,0,0.04)'
      }}
    >
      {/* Purple glow behind video */}
      <div className="absolute right-0 top-20 w-[45%] h-[70%] bg-[#9333EA]/15 rounded-full blur-[120px] opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center relative">
          {/* Text Content */}
          <div className="order-2 lg:order-1 opacity-0 translate-y-6 animate-[fadeInUp_0.6s_cubic-bezier(0.19,1,0.22,1)_80ms_forwards]">
            <div>
              <h2
                className="font-serif text-4xl md:text-5xl font-semibold text-[#9333EA] tracking-tight leading-[1.1] mb-2"
                style={{
                  textShadow: '0 2px 18px rgba(147,51,234,0.15)'
                }}
              >
                Apie mane
              </h2>
              <div className="bg-[#C084FC]/50 rounded-full h-[2px] w-[48px] mt-2 mb-6" />
            </div>
            <div className="space-y-5 opacity-0 translate-y-6 animate-[fadeInUp_0.6s_cubic-bezier(0.19,1,0.22,1)_160ms_forwards]">
              <p className="text-[18px] md:text-[19px] text-[#2B2B2B]/85 leading-relaxed tracking-[0.01em]">
                Esu Marius – profesionalus barberis, kuriam šis amatas tapo gyvenimo dalimi dar nuo vaikystės. Nuo pirmųjų žirklių rankose žinojau, kad tai bus mano kelias – ne darbas, o aistra, kuri nuolat auga kartu su manimi.
              </p>
              <p className="text-[18px] md:text-[19px] text-[#2B2B2B]/85 leading-relaxed tracking-[0.01em]">
               Man kirpimas – tai daugiau nei šukuosena. Tai procesas, kuriame žmogus keičiasi: išryškėja pasitikėjimas savimi, stilius įgauna formą, o veidrodyje atsispindi geriausia jo versija.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="mt-10 opacity-0 translate-y-6 animate-[fadeInUp_0.6s_cubic-bezier(0.19,1,0.22,1)_240ms_forwards]">
              <div className="grid grid-cols-3 gap-4 max-w-[660px]">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="group rounded-2xl border border-[#9333EA]/15 bg-gradient-to-b from-white to-[#FAF5FF] backdrop-blur-sm p-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] hover:border-[#9333EA]/40 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col items-center text-center"
                      aria-label={feature.label}
                    >
                      <Icon
                        size={28}
                        className="text-[#9333EA] mb-3 group-hover:text-[#C084FC] transition-all duration-500"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] md:text-[12px] font-semibold tracking-wider uppercase text-[#1A1A1A]/80">
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Purple gradient divider */}
              <div className="h-px w-full max-w-[660px] bg-gradient-to-r from-transparent via-[#9333EA]/15 to-transparent mt-8" />
            </div>
          </div>

          {/* Video Frame */}
          <div className="order-1 lg:order-2 opacity-0 scale-[0.96] animate-[fadeInScale_0.8s_cubic-bezier(0.19,1,0.22,1)_0ms_forwards] relative max-w-[420px] w-full ml-auto">
            <div className="relative rounded-[24px] overflow-hidden border border-[#9333EA]/20 bg-[#0c0c0c] shadow-[0_16px_48px_rgba(0,0,0,0.25)] aspect-[9/16] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:shadow-[0_24px_64px_rgba(147,51,234,0.25)] after:absolute after:inset-0 after:bg-gradient-to-b after:from-black/10 after:to-black/0 after:pointer-events-none group">
              {/* Purple glow ring */}
              <div className="absolute -z-10 inset-0 rounded-[28px] shadow-[0_0_0_1px_rgba(147,51,234,0.15),0_30px_80px_rgba(0,0,0,0.25)]" />

              {!hasError ? (
                <>
                  <video
                    ref={videoRef}
                    poster="/assets/thumbnail.webp"
                    className="relative z-0 w-full h-full object-cover"
                    playsInline
                    preload="metadata"
                    title="Barber video"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onError={handleVideoError}
                    onClick={handlePlayPause}
                  >
                    <source src="/assets/podcast-clip.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Play Button - Hidden when playing */}
                  <div
                    className={`absolute inset-0 z-10 flex items-center justify-center cursor-pointer transition-opacity duration-500 ${
                      isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                    onClick={handlePlayPause}
                  >
                    <div className="relative w-16 h-16 rounded-full bg-[#9333EA] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(147,51,234,0.4)] hover:scale-105 transition-all duration-400 ease-out after:absolute after:inset-0 after:rounded-full after:bg-[#9333EA]/30 after:animate-pulse-ring">
                      <Play size={28} fill="white" className="text-white ml-1 relative z-10" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1A1A1A] to-[#0B0B0B] text-[#DAD5CF]/60 p-6 z-10">
                  <img
                    src="/assets/thumbnail.webp"
                    alt="Video preview"
                    width="800"
                    height="600"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md"
                  />
                  <div className="relative z-10 text-center">
                    <AlertCircle size={48} className="mx-auto mb-4 text-[#9333EA]/60" strokeWidth={1.5} aria-hidden="true" />
                    <p className="text-sm font-medium mb-2">Peržiūrėti video</p>
                    <a
                      href="/assets/podcast-clip.mp4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 px-5 py-2 rounded-full bg-[#9333EA] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7E22CE] transition-colors duration-300"
                    >
                      Atidaryti
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
