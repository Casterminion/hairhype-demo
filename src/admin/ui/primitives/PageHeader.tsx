import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div className="min-w-0 flex-1">
        <h1 className="serif text-3xl lg:text-4xl font-semibold text-white mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[var(--muted)] text-sm lg:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
