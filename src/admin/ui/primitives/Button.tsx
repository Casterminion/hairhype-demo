import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subtle' | 'danger';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'admin-button inline-flex items-center justify-center gap-2 font-medium transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)] focus-visible:ring-2 focus-visible:ring-[#B58E4C]/60 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'admin-button-primary bg-[var(--gold)] text-white hover:bg-[var(--gold-2)] hover:shadow-[0_0_24px_rgba(181,142,76,0.3)] active:scale-[0.98] shadow-[var(--shadow-low)]',
      secondary: 'admin-button-secondary bg-transparent border border-white/10 text-white hover:bg-white/5 hover:border-white/20 active:scale-[0.98]',
      subtle: 'admin-button-subtle bg-white/5 text-white/70 hover:bg-white/10 hover:text-white active:scale-[0.98]',
      danger: 'admin-button-danger bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 hover:bg-[var(--danger)]/20 hover:border-[var(--danger)]/30 active:scale-[0.98]',
    };

    const sizeStyles = {
      md: 'px-4 py-2 text-sm rounded-[var(--radius-md)]',
      lg: 'px-6 py-3 text-base rounded-[var(--radius-lg)]',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
