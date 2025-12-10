import { ReactNode } from 'react';
import { useTheme } from '../AppShell';

interface ThemedProps {
  children: ReactNode | ((theme: 'light' | 'dark') => ReactNode);
}

/**
 * A component that provides theme-aware rendering
 * Can be used to conditionally render based on current theme
 */
export function Themed({ children }: ThemedProps) {
  const theme = useTheme();

  if (typeof children === 'function') {
    return <>{children(theme)}</>;
  }

  return <>{children}</>;
}

/**
 * Theme-aware class generator hook
 */
export function useThemedClasses() {
  const theme = useTheme();

  return {
    theme,
    // Card backgrounds
    card: theme === 'dark'
      ? 'bg-[#0D1117] border-white/[0.06]'
      : 'bg-white border-[var(--ink)]/8 shadow-sm',

    cardNavy: theme === 'dark'
      ? 'bg-[var(--navy)] border-white/[0.06]'
      : 'bg-white border-[var(--ink)]/8 shadow-sm',

    cardDark: theme === 'dark'
      ? 'bg-[#1C2128] border-white/[0.08]'
      : 'bg-[var(--surface)] border-[var(--ink)]/8',

    cardHover: theme === 'dark'
      ? 'hover:border-[#B58E4C]/40'
      : 'hover:border-[#B58E4C]/30 hover:shadow-md',

    // Text colors
    text: theme === 'dark' ? 'text-white' : 'text-[var(--ink)]',
    textSecondary: theme === 'dark' ? 'text-white/70' : 'text-[var(--ink)]/70',
    textMuted: theme === 'dark' ? 'text-white/50' : 'text-[var(--ink)]/50',
    textSubtle: theme === 'dark' ? 'text-white/40' : 'text-[var(--ink)]/40',

    // Borders
    border: theme === 'dark' ? 'border-white/[0.06]' : 'border-[var(--ink)]/8',
    borderStrong: theme === 'dark' ? 'border-white/10' : 'border-[var(--ink)]/12',
    divider: theme === 'dark' ? 'border-white/5' : 'border-[var(--ink)]/6',

    // Interactive states
    hover: theme === 'dark'
      ? 'hover:bg-white/[0.02]'
      : 'hover:bg-[var(--ink)]/[0.02]',

    active: theme === 'dark'
      ? 'active:bg-white/[0.04]'
      : 'active:bg-[var(--ink)]/[0.04]',

    // Input fields
    input: theme === 'dark'
      ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
      : 'bg-white border-[var(--ink)]/10 text-[var(--ink)] placeholder-[var(--ink)]/40',

    // Search bars
    searchBar: theme === 'dark'
      ? 'bg-[var(--navy)] border-white/[0.06]'
      : 'bg-white border-[var(--ink)]/8 shadow-sm',

    // Table elements
    tableHeader: theme === 'dark'
      ? 'bg-white/[0.02] border-b border-white/[0.06] text-white/60'
      : 'bg-[var(--ink)]/[0.02] border-b border-[var(--ink)]/8 text-[var(--ink)]/60',

    tableRow: theme === 'dark'
      ? 'divide-white/[0.04]'
      : 'divide-[var(--ink)]/[0.04]',

    tableCellHover: theme === 'dark'
      ? 'hover:bg-white/[0.02]'
      : 'hover:bg-[var(--ink)]/[0.01]',

    // Stat cards
    statCard: theme === 'dark'
      ? 'bg-[var(--navy)] border-white/[0.06]'
      : 'bg-white border-[var(--ink)]/8 shadow-sm',

    // Icon backgrounds
    iconBg: theme === 'dark'
      ? 'bg-[var(--gold)]/10'
      : 'bg-[var(--gold)]/10',

    iconBorder: theme === 'dark'
      ? 'border-[var(--gold)]/20'
      : 'border-[var(--gold)]/20',

    // Skeleton loaders
    skeleton: theme === 'dark'
      ? 'bg-white/5'
      : 'bg-[var(--ink)]/5',

    skeletonPulse: theme === 'dark'
      ? 'bg-white/10'
      : 'bg-[var(--ink)]/10',
  };
}
