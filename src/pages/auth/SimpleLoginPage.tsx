import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const SimpleLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting direct login with Supabase');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        throw signInError;
      }
      
      if (data?.user) {
        console.log('Login successful');
        
        // Fetch basic user info to determine admin status
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();
        
        // Redirect based on admin status
        if (profileData?.is_admin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error('Login failed - no user data received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-mystic-primary-900 to-black">
      <div className="m-auto w-full max-w-md p-8 space-y-8 bg-black/30 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">MysticBanana</h1>
          <p className="mt-2 text-sm text-gray-300">Welcome back to your spiritual journey</p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
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
              className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/20 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-mystic-accent-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/20 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-mystic-accent-500"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-mystic-accent-600 hover:bg-mystic-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mystic-accent-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="text-mystic-accent-400 hover:text-mystic-accent-300">
              Sign up
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            <a href="/forgot-password" className="hover:text-mystic-accent-300">
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginPage;
