import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  const { isAuthenticated, logout } = useAuthStore();

  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: -20 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.1
      }
    })
  };

  return (
    <motion.div
      initial="closed"
      animate="open"
      variants={menuVariants}
      className="fixed inset-0 top-16 bg-white dark:bg-mystic-primary-900 z-40 p-6"
    >
      <div className="flex flex-col space-y-4 h-full">
        <div className="flex-1">
          <nav className="flex flex-col space-y-6 py-6">
            {[
              { to: "/magazine", label: "Magazine" },
              { to: "/podcasts", label: "Podcasts" },
              { to: "/tarot", label: "Tarot" },
              { to: "/horoscopes", label: "Horoscopes" },
              { to: "/meditation", label: "Meditation" },
              { to: "/shop", label: "Shop" }
            ].map((item, i) => (
              <motion.div key={item.to} custom={i} variants={itemVariants}>
                <Link
                  to={item.to}
                  className="text-xl font-medium text-mystic-secondary-900 dark:text-white hover:text-mystic-primary-600 transition-colors"
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            variants={itemVariants}
            custom={7}
            className="pt-6 border-t border-gray-200 dark:border-mystic-primary-700"
          >
            <h3 className="font-serif font-semibold text-lg text-mystic-secondary-900 dark:text-white mb-4">
              Explore by Category
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Astrology",
                "Spirituality",
                "Wellbeing",
                "Relationships",
                "Mindfulness",
                "Self-Discovery"
              ].map((category, i) => (
                <motion.div key={category} custom={8 + i} variants={itemVariants}>
                  <Link
                    to={`/category/${category.toLowerCase()}`}
                    className="block text-mystic-secondary-700 dark:text-mystic-secondary-300 hover:text-mystic-primary-600 transition-colors text-sm"
                    onClick={onClose}
                  >
                    {category}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {!isAuthenticated ? (
          <motion.div 
            variants={itemVariants} 
            custom={14}
            className="flex flex-col space-y-3 pt-6 border-t border-gray-200 dark:border-mystic-primary-700"
          >
            <Link
              to="/login"
              className="w-full py-3 bg-transparent border border-mystic-primary-600 text-mystic-primary-600 rounded-md font-medium text-center transition-colors hover:bg-mystic-primary-50"
              onClick={onClose}
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="w-full py-3 bg-mystic-primary-600 text-white rounded-md font-medium text-center transition-colors hover:bg-mystic-primary-700"
              onClick={onClose}
            >
              Sign Up
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={itemVariants} 
            custom={14}
            className="flex flex-col space-y-3 pt-6 border-t border-gray-200 dark:border-mystic-primary-700"
          >
            <Link
              to="/dashboard"
              className="text-mystic-secondary-800 dark:text-white hover:text-mystic-primary-600 transition-colors"
              onClick={onClose}
            >
              My Dashboard
            </Link>
            <Link
              to="/saved-content"
              className="text-mystic-secondary-800 dark:text-white hover:text-mystic-primary-600 transition-colors"
              onClick={onClose}
            >
              Saved Content
            </Link>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-left text-mystic-secondary-800 dark:text-white hover:text-mystic-accent-600 transition-colors"
            >
              Log Out
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MobileMenu;