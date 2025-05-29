import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Podcast, BarChart2, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminLayout: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); 
  };

  // No loading state needed here as AdminAuthGuard handles authentication

  return (
    <div className="flex h-screen bg-dark-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 p-6 space-y-6 border-r border-dark-700 flex flex-col">
        <div>
          <Link to="/" className="flex items-center space-x-2 mb-10">
            <span className="text-2xl font-serif font-bold text-white">
              Mystic<span className="text-accent-500">Banana</span>
            </span>
          </Link>
          <nav className="space-y-2">
            <Link to="/admin/dashboard" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/articles" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
              <span>Articles</span>
            </Link>
            <Link to="/admin/categories" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-open"><path d="M20 12.58V7.42C20 6.12579 18.8742 5 17.58 5H9.42C8.12579 5 7 6.12579 7 7.42V16.58C7 17.8742 8.12579 19 9.42 19H13.5"/><path d="M20 14H14v6h6v-2a2 2 0 0 0-2-2Z"/><path d="M4 20h10"/></svg>
              <span>Categories</span>
            </Link>
            <Link to="/admin/podcasts" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
              <Podcast className="w-5 h-5" />
              <span>Podcasts</span>
            </Link>
            <Link to="/admin/comments" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span>Comments</span>
            </Link>
            <Link to="/admin/analytics" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
              <BarChart2 className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
            <Link to="/admin/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
        <div className="mt-auto">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-dark-200 hover:bg-dark-700 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
};

export default AdminLayout;
