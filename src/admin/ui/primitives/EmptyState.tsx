import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mb-4">
        <Icon size={32} className="text-[var(--gold)]" />
      </div>

      <h3 className="serif text-xl font-semibold text-[var(--ink)] mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-[var(--muted)] mb-6 max-w-md">
          {description}
        </p>
      )}

      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
}
