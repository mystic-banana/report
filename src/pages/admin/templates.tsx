import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import AdminLayout from '../../components/layouts/AdminLayout';
import TemplateManager from '../../components/admin/TemplateManager';
import { Loader } from 'lucide-react';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TemplatesAdminPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Check if current user is an admin
  const checkAdminStatus = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User is not logged in, redirect to login
        navigate('/login', { replace: true });
        return;
      }

      // Check if user is in admin_users table
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
      }
      
      if (adminData) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        // Not an admin, redirect to home page
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  if (isAdmin === null) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-magazine-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <TemplateManager />
      </div>
    </AdminLayout>
  );
};

export default TemplatesAdminPage;
