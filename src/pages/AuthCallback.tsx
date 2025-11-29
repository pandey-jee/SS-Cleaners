import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_EMAIL } from "@/lib/constants";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          toast({
            title: "Authentication Error",
            description: "Failed to complete login. Please try again.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        if (session?.user) {
          // Check if user is admin
          if (session.user.email === ADMIN_EMAIL) {
            toast({
              title: "Admin Login Successful",
              description: "Redirecting to admin dashboard...",
            });
            navigate("/admin/dashboard");
          } else {
            toast({
              title: "Login Successful",
              description: "Welcome back!",
            });
            navigate("/");
          }
        } else {
          // No session found, redirect to login
          navigate("/login");
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700">Completing login...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we redirect you</p>
      </div>
    </div>
  );
};

export default AuthCallback;
