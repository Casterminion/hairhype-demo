/**
 * Theme-aware utility classes for admin interface
 * Returns appropriate classes based on light/dark theme
 */

type Theme = 'light' | 'dark';

export const themeClasses = {
  // Card backgrounds
  card: (theme: Theme) =>
    theme === 'dark'
      ? 'bg-[#0D1117] border-white/[0.06]'
      : 'bg-white border-[var(--ink)]/8',

  cardHover: (theme: Theme) =>
    theme === 'dark'
      ? 'hover:border-[#B58E4C]/40'
      : 'hover:border-[#B58E4C]/30',

  // Navy card (for lists, tables)
  cardNavy: (theme: Theme) =>
    theme === 'dark'
      ? 'bg-[var(--navy)] border-white/[0.06]'
      : 'bg-white border-[var(--ink)]/8',

  // Dark card (for nested items)
  cardDark: (theme: Theme) =>
    theme === 'dark'
      ? 'bg-[#1C2128] border-white/[0.08]'
      : 'bg-[var(--surface)] border-[var(--ink)]/8',

  // Text colors
  textPrimary: (theme: Theme) =>
    theme === 'dark' ? 'text-white' : 'text-[var(--ink)]',

  textSecondary: (theme: Theme) =>
    theme === 'dark' ? 'text-white/70' : 'text-[var(--ink)]/70',

  textMuted: (theme: Theme) =>
    theme === 'dark' ? 'text-white/50' : 'text-[var(--ink)]/50',

  textSubtle: (theme: Theme) =>
    theme === 'dark' ? 'text-white/40' : 'text-[var(--ink)]/40',

  // Borders
  border: (theme: Theme) =>
    theme === 'dark' ? 'border-white/[0.06]' : 'border-[var(--ink)]/8',

  borderStrong: (theme: Theme) =>
    theme === 'dark' ? 'border-white/10' : 'border-[var(--ink)]/12',

  divider: (theme: Theme) =>
    theme === 'dark' ? 'border-white/5' : 'border-[var(--ink)]/6',

  // Interactive states
  hover: (theme: Theme) =>
    theme === 'dark'
      ? 'hover:bg-white/[0.02]'
      : 'hover:bg-[var(--ink)]/[0.02]',

  active: (theme: Theme) =>
    theme === 'dark'
      ? 'active:bg-white/[0.04]'
      : 'active:bg-[var(--ink)]/[0.04]',

  // Input fields
  input: (theme: Theme) =>
    theme === 'dark'
      ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
      : 'bg-white border-[var(--ink)]/10 text-[var(--ink)] placeholder-[var(--ink)]/40',

  inputFocus: (theme: Theme) =>
    'focus:ring-2 focus:ring-[var(--gold)]/60 focus:border-[var(--gold)]',

  // Search bars
  searchBar: (theme: Theme) =>
    theme === 'dark'
      ? 'bg-[var(--navy)] border-white/[0.06]'
      : 'bg-white border-[var(--ink)]/8',

  // Table headers
  tableHeader: (theme: Theme) =>
    theme === 'dark'
      ? 'bg-white/[0.02] border-b border-white/[0.06] text-white/60'
      : 'bg-[var(--ink)]/[0.02] border-b border-[var(--ink)]/8 text-[var(--ink)]/60',

  tableRow: (theme: Theme) =>
    theme === 'dark'
      ? 'divide-white/[0.04]'
      : 'divide-[var(--ink)]/[0.04]',

  // Stat cards and info
  statCard: (theme: Theme) =>
    theme === 'dark'
      ? 'bg-[var(--navy)]'
      : 'bg-white',

  // Empty states
  emptyState: (theme: Theme) =>
    theme === 'dark'
      ? 'text-white/60'
      : 'text-[var(--ink)]/60',

  // Skeleton loaders
  skeleton: (theme: Theme) =>
    theme === 'dark'
      ? 'bg-white/5'
      : 'bg-[var(--ink)]/5',

  skeletonPulse: (theme: Theme) =>
    theme === 'dark'
      ? 'bg-white/10'
      : 'bg-[var(--ink)]/10',
};

/**
 * Combine multiple theme classes
 */
export function cn(theme: Theme, ...keys: (keyof typeof themeClasses)[]) {
  return keys.map(key => themeClasses[key](theme)).join(' ');
}
