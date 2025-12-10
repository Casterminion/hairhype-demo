import { Calendar } from 'lucide-react';

interface ReservationButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ReservationButton({
  onClick,
  variant = 'primary',
  size = 'lg',
  className = ''
}: ReservationButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B58E4C]';

  const variantClasses = {
    primary: 'bg-[#B58E4C] text-white hover:bg-[#A07D43] shadow-[0_4px_14px_rgba(181,142,76,0.4)] hover:shadow-[0_6px_20px_rgba(181,142,76,0.5)]',
    secondary: 'bg-white text-[#B58E4C] border-2 border-[#B58E4C] hover:bg-[#B58E4C] hover:text-white shadow-sm hover:shadow-md'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <Calendar size={size === 'sm' ? 18 : size === 'md' ? 20 : 24} />
      <span>Rezervuoti vizitą</span>
    </button>
  );
}
