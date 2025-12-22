import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiFetch, clearToken, getToken } from '../lib/apiClient';
import type { UserProfile, UserRole } from '../types/auth';

interface ProtectedRouteProps {
  roles?: UserRole[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const [status, setStatus] = useState<'loading' | 'unauth' | 'forbidden' | 'ready'>('loading');

  useEffect(() => {
    const run = async () => {
      const token = getToken();
      if (!token) {
        setStatus('unauth');
        return;
      }

      try {
        const profile = (await apiFetch('/api/me')) as UserProfile;
        if (roles && !roles.includes(profile.role)) {
          setStatus('forbidden');
          return;
        }
        setStatus('ready');
      } catch (error) {
        clearToken();
        setStatus('unauth');
      }
    };

    run();
  }, [roles]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauth') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'forbidden') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
