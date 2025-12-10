import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = false, className = '', ...props }: CardProps) {
  const hoverStyles = hover ? 'hover:shadow-[var(--shadow-med)] hover:-translate-y-0.5' : '';

  return (
    <div
      className={`bg-[var(--card)] border border-black/6 rounded-[var(--radius-lg)] shadow-[var(--shadow-low)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)] ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-b border-black/6 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-t border-black/6 ${className}`} {...props}>
      {children}
    </div>
  );
};
