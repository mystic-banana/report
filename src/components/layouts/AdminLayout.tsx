import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  BarChart2, 
  LogOut,
  FileImage,
  Menu,
  X
} from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/reports', label: 'Reports', icon: FileText },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/templates', label: 'Templates', icon: FileImage },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(`Failed to log out: ${error.message}`);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-col bg-dark-800 border-r border-dark-700">
        <div className="p-4 border-b border-dark-700">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/logo.svg" 
              alt="Mystic Banana" 
              className="h-8 w-8" 
            />
            <span className="font-bold text-xl">Mystic Banana</span>
          </Link>
          <div className="mt-1 text-sm text-gray-400">Admin Dashboard</div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-magazine-accent text-white' 
                    : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-dark-700">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
            icon={LogOut}
          >
            Log Out
          </Button>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="flex flex-col w-full">
        <div className="lg:hidden flex items-center justify-between p-4 bg-dark-800 border-b border-dark-700">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/logo.svg" 
              alt="Mystic Banana" 
              className="h-8 w-8" 
            />
            <span className="font-bold text-xl">Mystic Banana</span>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            icon={isMobileMenuOpen ? X : Menu}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          />
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-dark-900 bg-opacity-95 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <div className="font-bold text-xl">Menu</div>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={toggleMobileMenu}
                aria-label="Close menu"
              />
            </div>
            
            <nav className="flex-1 py-6 px-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link 
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-magazine-accent text-white' 
                        : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-dark-700">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                icon={LogOut}
              >
                Log Out
              </Button>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
