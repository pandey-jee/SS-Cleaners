import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash parameters from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          // Set the session with the tokens from URL
          const { data: { user }, error } = await supabase.auth.getUser(accessToken);

          if (error) {
            console.error('Error getting user:', error);
            navigate('/login?error=auth_failed');
            return;
          }

          if (user) {
            console.log('Google OAuth successful:', user.email);
            
            // Check if user has admin role
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', user.id)
              .single();

            // Redirect based on role
            if (profile?.role === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/');
            }
          }
        } else {
          // No tokens in URL, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=auth_error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Completing sign in...</h2>
        <p className="text-gray-500 mt-2">Please wait while we verify your account</p>
      </div>
    </div>
  );
};

export default AuthCallback;
