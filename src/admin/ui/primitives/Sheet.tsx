import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTheme } from '../AppShell';

type Side = 'right' | 'left' | 'bottom' | 'top';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** right | left | bottom | top (default: right) */
  side?: Side;
  /** Extra classes for the panel (e.g., bg overrides) */
  panelClassName?: string;
  /** Extra classes for the overlay */
  overlayClassName?: string;
  /** Optional custom header node; if provided, replaces the default header */
  header?: React.ReactNode;
  /** Trap focus & close on Esc (default true) */
  trap?: boolean;
  children: React.ReactNode;
}

/**
 * Luxury-grade Sheet (Drawer) for admin:
 * - Dark theme by default (no more white-on-white)
 * - Animated slide-in/out per side
 * - Click-outside & Esc to close
 * - Sticky header with luxe typography
 * - Works across all places where <Sheet> is used already
 */
export function Sheet({
  isOpen,
  onClose,
  title,
  side = 'right',
  panelClassName = '',
  overlayClassName = '',
  header,
  trap = true,
  children,
}: SheetProps) {
  const theme = useTheme();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    if (!trap || !isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [trap, isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Animation per side
  const sideEnter =
    side === 'right'
      ? 'translate-x-full'
      : side === 'left'
      ? '-translate-x-full'
      : side === 'bottom'
      ? 'translate-y-full'
      : '-translate-y-full';

  const sideInset =
    side === 'right'
      ? 'inset-y-0 right-0'
      : side === 'left'
      ? 'inset-y-0 left-0'
      : side === 'bottom'
      ? 'inset-x-0 bottom-0'
      : 'inset-x-0 top-0';

  // Panel sizing per side (right/left = 480 on desktop, full on mobile)
  const widthClass =
    side === 'right' || side === 'left'
      ? 'w-full max-w-[560px] md:max-w-[520px] lg:max-w-[520px]'
      : 'w-full';

  // Theme-aware styling tokens
  const basePanel = theme === 'dark'
    ? 'relative h-full bg-[#0B0F16] text-white shadow-[0_8px_60px_rgba(0,0,0,0.5)] border border-white/5 ring-1 ring-white/[0.04]'
    : 'relative h-full bg-white text-[#0F172A] shadow-[0_8px_60px_rgba(0,0,0,0.15)] border border-black/10';

  const baseHeader = theme === 'dark'
    ? 'sticky top-0 z-10 bg-[#0B0F16] border-b border-white/5'
    : 'sticky top-0 z-10 bg-white border-b border-black/10';

  const baseTitle = theme === 'dark'
    ? 'font-serif text-[22px] leading-tight tracking-[0.2px] text-white/90 select-none'
    : 'font-serif text-[22px] leading-tight tracking-[0.2px] text-[#0F172A] select-none';

  const baseOverlay =
    'fixed inset-0 z-[99998] bg-[#000000]/60 backdrop-blur-sm opacity-100 ' +
    'transition-opacity duration-300 ease-out will-change-[opacity]';

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* OVERLAY */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={`${baseOverlay} ${overlayClassName}`}
        style={{ display: isOpen ? 'block' : 'none' }}
      />

      {/* PANEL */}
      <div
        data-admin-theme={theme}
        className={`fixed ${sideInset} ${widthClass} z-[99999]
          transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]
          ${isOpen ? 'translate-x-0 translate-y-0' : sideEnter}
          ${theme === 'dark' ? 'bg-[#0B0F16]' : 'bg-white'}
        `}
        style={{ zIndex: 99999 }}
        aria-hidden={!isOpen}
      >
        <div
          ref={panelRef}
          className={`${basePanel} ${panelClassName} ${
            side === 'right' || side === 'left' ? 'h-full' : ''
          }`}
        >
          {/* HEADER */}
          {header ? (
            header
          ) : (
            <div className={`${baseHeader}`}>
              <div className="flex items-center justify-between px-6 py-4">
                <div className="min-w-0 pr-3">
                  {title ? (
                    <h3 className={`${baseTitle} truncate`}>{title}</h3>
                  ) : null}
                </div>

                <button
                  onClick={onClose}
                  className={`inline-flex items-center justify-center rounded-full transition-colors p-2 ${
                    theme === 'dark'
                      ? 'text-white/70 hover:text-white hover:bg-white/5'
                      : 'text-[#0F172A]/70 hover:text-[#0F172A] hover:bg-black/5'
                  }`}
                  aria-label="Uždaryti"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className={`admin-sheet-content p-6 overflow-auto max-h-[100dvh] ${theme === 'dark' ? 'bg-[#0B0F16]' : 'bg-white'}`}>
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
