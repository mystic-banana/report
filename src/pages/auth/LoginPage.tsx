import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Star, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminRequired, setAdminRequired] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const { login, isLoading: storeLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use combined loading state for better UI reliability
  const isLoading = storeLoading || localLoading;
  
  // Check if we were redirected from admin page
  useEffect(() => {
    const state = location.state as { from?: { pathname: string }, adminRequired?: boolean };
    if (state?.adminRequired) {
      setAdminRequired(true);
    }
  }, [location]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted');
    
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      useAuthStore.setState({ 
        error: 'Please enter both email and password'
      });
      return;
    }

    // Use local loading state to ensure UI feedback even if store state gets stuck
    setLocalLoading(true);
    
    try {
      // Direct login without race conditions
      await login(email, password);
      
      // Immediately check auth state
      const authState = useAuthStore.getState();
      console.log('Auth state after login attempt:', { 
        hasUser: !!authState.user,
        isAdmin: authState.user?.isAdmin,
        error: authState.error
      });
      
      // If there's an error in the store, show it
      if (authState.error) {
        setLocalLoading(false);
        return;
      }
      
      // If we have a user, handle admin requirements and redirect
      if (authState.user) {
        if (adminRequired && !authState.user.isAdmin) {
          useAuthStore.setState({ 
            error: 'Admin access required. You do not have admin privileges.'
          });
          setLocalLoading(false);
          return;
        }
        
        // Navigate based on user type
        if (authState.user.isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // If no user but also no error, something went wrong
        console.error('Login completed but no user available');
        useAuthStore.setState({ 
          error: 'Login failed. Please try again.'
        });
        setLocalLoading(false);
      }
    } catch (err: any) {
      // Handle login error
      console.error('Login failed with exception:', err);
      useAuthStore.setState({ 
        error: err.message || 'Login failed. Please try again.'
      });
      setLocalLoading(false);
    }
  }, [email, password, login, adminRequired, navigate]);

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mystic-primary-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 opacity-20">
          <Star className="w-12 h-12 text-mystic-gold-500" />
        </div>
        <div className="absolute top-3/4 left-1/3 opacity-10">
          <Moon className="w-24 h-24 text-mystic-secondary-500" />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-15">
          <Star className="w-16 h-16 text-mystic-accent-400" />
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-lg shadow-xl overflow-hidden"
      >
        <div className="px-6 py-8 sm:px-10">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="font-serif font-bold text-3xl text-white">
                Mystic<span className="text-mystic-accent-400">Banana</span>
              </h1>
            </Link>
            <p className="mt-2 text-mystic-secondary-200">
              Welcome back to your spiritual journey
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/30 border border-red-600 rounded-md">
                <p className="text-white text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/20 border border-white/30 rounded-md placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-mystic-accent-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white/20 border border-white/30 rounded-md placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-mystic-accent-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-white/70" />
                  ) : (
                    <Eye className="h-5 w-5 text-white/70" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-white/20 border-white/30 rounded focus:ring-mystic-accent-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-mystic-accent-300 hover:text-mystic-accent-200">
                  Forgot your password?
                </Link>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-mystic-accent-600 hover:bg-mystic-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mystic-accent-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2">Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-mystic-primary-900/50 text-white">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href="#"
                className="w-full flex items-center justify-center px-4 py-2 border border-white/30 rounded-md shadow-sm text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Google
              </a>
              <a
                href="#"
                className="w-full flex items-center justify-center px-4 py-2 border border-white/30 rounded-md shadow-sm text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-white/5 border-t border-white/10 sm:px-10">
          <p className="text-sm text-center text-white">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-mystic-accent-400 hover:text-mystic-accent-300">
              Sign up now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;