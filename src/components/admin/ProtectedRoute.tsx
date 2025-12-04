import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/constants';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.warn('[Security] Unauthorized access attempt to admin route - No user');
        navigate('/login', { replace: true });
      } else if (!isAdmin) {
        console.warn(`[Security] Unauthorized access attempt by user: ${user.email}`);
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
