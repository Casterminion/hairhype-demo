import { Instagram } from 'lucide-react';
import { useState } from 'react';

interface InstagramFabProps {
  hide?: boolean;
}

export default function InstagramFab({ hide = false }: InstagramFabProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (hide) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="https://www.instagram.com/hair_hype_junior/"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[var(--accent)] text-white shadow-[var(--shadow)] hover:scale-105 hover:shadow-[0_15px_50px_rgba(106,70,240,0.5)] transition-all duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-500)] focus-visible:outline-offset-2"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label="Peržiūrėti darbus Instagram"
      >
        <Instagram size={24} strokeWidth={2} />

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-[var(--ink)] text-white text-sm whitespace-nowrap rounded-lg shadow-lg animate-fade-in pointer-events-none">
            Peržiūrėti darbus Instagram
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[var(--ink)]" />
          </div>
        )}
      </a>
    </div>
  );
}
