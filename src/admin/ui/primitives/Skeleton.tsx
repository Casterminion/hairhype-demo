interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-[var(--radius-md)]',
  };

  return (
    <div
      className={`
        bg-gradient-to-r from-black/5 via-[var(--gold)]/5 to-black/5
        bg-[length:200%_100%] animate-shimmer
        ${variants[variant]} ${className}
      `}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'circular' ? width : undefined),
        animation: 'shimmer 2s ease-in-out infinite'
      }}
    />
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="rectangular" width="60px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" />
            <Skeleton width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton width="70%" height="24px" />
      <Skeleton width="100%" />
      <Skeleton width="90%" />
      <Skeleton width="80%" />
    </div>
  );
}
