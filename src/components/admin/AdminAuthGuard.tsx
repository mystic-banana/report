import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsChecking(true);
        setError(null);

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('[AdminAuthGuard] No session found, redirecting to login');
          setIsChecking(false);
          return;
        }

        // Check if user exists in profiles table and is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('[AdminAuthGuard] Error fetching profile:', profileError);
          setError('Error verifying admin status');
          setIsChecking(false);
          return;
        }

        if (!profile || !profile.is_admin) {
          console.log('[AdminAuthGuard] User is not an admin:', profile);
          setIsAdmin(false);
        } else {
          console.log('[AdminAuthGuard] Admin status confirmed');
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('[AdminAuthGuard] Unexpected error:', err);
        setError('Unexpected error checking admin status');
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, [location.pathname]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-900 text-white">
        <div className="w-12 h-12 border-4 border-t-accent-500 border-r-accent-500 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  // If not admin, redirect to login
  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: location, adminRequired: true }} replace />;
  }

  // If there's an error, show it
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-900 text-white">
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm">Please try logging in again.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If admin, render children
  return <>{children}</>;
};

export default AdminAuthGuard;
