import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { UserCircle, BookmarkIcon, Settings, LogOut, Crown } from 'lucide-react';

interface UserMenuProps {
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 rounded-md shadow-lg py-2 z-50"
    >
      <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-600">
        <div className="flex items-center">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <UserCircle className="w-10 h-10 text-gray-500 dark:text-dark-400 mr-3" />
          )}
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-dark-300 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="py-1">
        <Link 
          to="/dashboard" 
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-700"
          onClick={onClose}
        >
          <UserCircle className="w-4 h-4 mr-3 text-gray-500 dark:text-dark-400" />
          My Dashboard
        </Link>
        
        <Link 
          to="/saved-content" 
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-700"
          onClick={onClose}
        >
          <BookmarkIcon className="w-4 h-4 mr-3 text-gray-500 dark:text-dark-400" />
          Saved Content
        </Link>
        
        <Link 
          to="/settings" 
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-700"
          onClick={onClose}
        >
          <Settings className="w-4 h-4 mr-3 text-gray-500 dark:text-dark-400" />
          Account Settings
        </Link>
      </div>

      {!user?.isPremium && (
        <div className="py-1 border-t border-gray-100 dark:border-dark-600">
          <Link 
            to="/premium" 
            className="flex items-center px-4 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-dark-700"
            onClick={onClose}
          >
            <Crown className="w-4 h-4 mr-3 text-yellow-500 dark:text-yellow-400" />
            Upgrade to Premium
          </Link>
        </div>
      )}

      <div className="py-1 border-t border-gray-100 dark:border-dark-600">
        <button 
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-700"
        >
          <LogOut className="w-4 h-4 mr-3 text-gray-500 dark:text-dark-400" />
          Log Out
        </button>
      </div>
    </motion.div>
  );
};

export default UserMenu;