import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Star, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(name, email, password);
    
    // Navigate to home page if successful
    // Check the store's error state *after* the async register call has completed
    if (!useAuthStore.getState().error) { 
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mystic-secondary-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/5 opacity-20">
          <Star className="w-12 h-12 text-mystic-gold-500" />
        </div>
        <div className="absolute top-3/4 right-1/3 opacity-10">
          <Moon className="w-24 h-24 text-mystic-secondary-500" />
        </div>
        <div className="absolute top-1/3 left-1/4 opacity-15">
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
              Begin your spiritual journey today
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/30 border border-red-600 rounded-md">
                <p className="text-white text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/20 border border-white/30 rounded-md placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-mystic-accent-500"
                placeholder="Your Name"
              />
            </div>
            
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white/20 border border-white/30 rounded-md placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-mystic-accent-500"
                  placeholder="Create a strong password"
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
              <p className="mt-1 text-xs text-mystic-secondary-300">
                Must be at least 8 characters and include a number and symbol
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 bg-white/20 border-white/30 rounded focus:ring-mystic-accent-500"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-white">
                I agree to the <Link to="/terms" className="text-mystic-accent-300 hover:text-mystic-accent-200">Terms of Service</Link> and <Link to="/privacy" className="text-mystic-accent-300 hover:text-mystic-accent-200">Privacy Policy</Link>
              </label>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-mystic-accent-600 hover:bg-mystic-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mystic-accent-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Create Account"
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
                <span className="px-2 bg-mystic-secondary-900/50 text-white">
                  Or sign up with
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
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-mystic-accent-400 hover:text-mystic-accent-300">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;