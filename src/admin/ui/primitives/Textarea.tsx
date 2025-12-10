import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helpText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/90 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-2.5 bg-[#161B22] border ${
            error ? 'border-[var(--danger)]' : 'border-white/[0.12]'
          } rounded-[var(--radius-md)] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)]/60 transition-all duration-[var(--duration-fast)] resize-vertical min-h-[100px] hover:border-white/[0.2] ${className}`}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
