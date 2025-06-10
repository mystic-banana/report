import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium' | 'pro';
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        // Get current user from auth
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }
        
        if (!authUser?.user) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Get user profile data
        let { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.user.id)
          .single();

        // If profile doesn't exist, create it
        if (profileError && profileError.code === 'PGRST116') {
          console.log('No profile found for user, creating one...');
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .upsert({
              id: authUser.user.id,
              username: authUser.user.email?.split('@')[0],
              full_name: authUser.user.user_metadata?.full_name,
              avatar_url: authUser.user.user_metadata?.avatar_url,
            })
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }
          profileData = newProfile;
        } else if (profileError) {
          // For any other errors, throw them
          throw profileError;
        }

        setUser({
          id: authUser.user.id,
          email: authUser.user.email || '',
          display_name: profileData?.display_name,
          avatar_url: profileData?.avatar_url,
          subscription_tier: profileData?.subscription_tier || 'free'
        });
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err instanceof Error ? err : new Error('Failed to load user'));
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    getUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        getUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  return { user, loading, error };
}
