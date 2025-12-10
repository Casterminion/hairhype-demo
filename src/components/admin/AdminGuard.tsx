import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#252538] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#B58E4C]/30 border-t-[#B58E4C] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
