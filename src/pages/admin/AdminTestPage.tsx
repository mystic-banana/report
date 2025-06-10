import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

const AdminTestPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    console.log('AdminTestPage mounted');
    console.log('Auth state:', { 
      isLoading, 
      isAuthenticated, 
      user: user ? {
        id: user.id,
        name: user.name,
        isAdmin: user.isAdmin
      } : null 
    });
  }, [isLoading, isAuthenticated, user]);

  return (
    <div className="p-6 bg-dark-800 rounded-lg">
      <h1 className="text-2xl font-bold text-white mb-4">Admin Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-dark-700 p-4 rounded">
          <h2 className="text-lg font-semibold text-white mb-2">Authentication Status:</h2>
          <pre className="bg-dark-900 p-3 rounded text-green-400 overflow-auto">
            {JSON.stringify({
              isLoading,
              isAuthenticated,
              user: user ? {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
              } : null
            }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-dark-700 p-4 rounded">
          <h2 className="text-lg font-semibold text-white mb-2">Current Route:</h2>
          <pre className="bg-dark-900 p-3 rounded text-green-400">
            {window.location.pathname}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AdminTestPage;
