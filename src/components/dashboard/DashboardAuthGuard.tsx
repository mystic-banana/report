import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface DashboardAuthGuardProps {
  children: React.ReactNode;
}

const DashboardAuthGuard: React.FC<DashboardAuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // If auth store is done loading, update our local state
    if (!isLoading) {
      setIsChecking(false);
    }
  }, [isLoading]);

  if (isChecking || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-900 text-white">
        <div className="w-12 h-12 border-4 border-t-accent-500 border-r-accent-500 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is an admin, redirect to admin dashboard
  if (user?.isAdmin) {
    console.log('User is admin, redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If authenticated regular user, render children
  return <>{children}</>;
};

export default DashboardAuthGuard;
