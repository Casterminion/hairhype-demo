import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helpText, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--ink)]/80 dark:text-white/80 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 bg-white dark:bg-[var(--ink-2)] border ${
            error ? 'border-[var(--danger)]' : 'border-black/10 dark:border-white/10'
          } rounded-[var(--radius-md)] text-[var(--ink)] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60 focus:border-[var(--gold)] transition-all duration-[var(--duration-fast)] ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-[var(--danger)]">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1.5 text-sm text-[var(--muted)]">{helpText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
