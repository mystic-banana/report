import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  is_admin?: boolean;
  is_premium?: boolean;
}

interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  is_admin: boolean;
  is_premium: boolean;
  preferences?: Record<string, any>;
  saved_content?: Record<string, any>;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: any;
  loading: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, userData: { fullName: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isAdmin: false,
  isPremium: false,
  
  initializeAuth: async () => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ loading: false });
        return;
      }
      
      // Set the user from the session
      const user = session.user;
      
      // Get the user's profile from the profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      set({ 
        user,
        profile,
        session,
        loading: false,
        isAdmin: profile?.is_admin || false,
        isPremium: profile?.is_premium || false
      });
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_IN' && newSession) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          
          set({ 
            user: newSession.user,
            profile,
            session: newSession,
            isAdmin: profile?.is_admin || false,
            isPremium: profile?.is_premium || false
          });
        } else if (event === 'SIGNED_OUT') {
          set({ 
            user: null,
            profile: null,
            session: null,
            isAdmin: false,
            isPremium: false
          });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false });
    }
  },
  
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      set({ 
        user: data.user,
        profile,
        session: data.session,
        isAdmin: profile?.is_admin || false,
        isPremium: profile?.is_premium || false
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  signup: async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName
          }
        }
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Note: Profile creation is handled by a database trigger
      
      set({ 
        user: data.user,
        session: data.session,
        loading: false
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    set({ 
      user: null,
      profile: null,
      session: null,
      isAdmin: false,
      isPremium: false
    });
  },
  
  refreshProfile: async () => {
    const { user } = get();
    
    if (!user) {
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    set({ 
      profile,
      isAdmin: profile?.is_admin || false,
      isPremium: profile?.is_premium || false
    });
  }
}));
