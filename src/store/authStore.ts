import { create } from "zustand";
import type { User } from "../types";
import { supabase } from "../lib/supabaseClient";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  justConfirmedEmailAndSignedIn: boolean;

  // Core auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Internal helper functions
  createDefaultProfile: (userId: string) => Partial<User>;

  // Profile management
  fetchUserProfile: (userId: string, authUser?: SupabaseUser | null) => Promise<Partial<User> | null>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;

  // Permission helpers
  hasPermission: (action: string) => boolean;
  isPremiumUser: () => boolean;
  isAdminUser: () => boolean;

  // Auth initialization
  initializeAuth: () => () => void;
  setJustConfirmedEmailAndSignedIn: (value: boolean) => void;

  // Error handling
  clearError: () => void;
}

const mapSupabaseUserToAppUser = (
  authUser: SupabaseUser,
  profile?: Partial<User> | null,
): User => {
  return {
    id: authUser.id,
    email: authUser.email || "",
    name: profile?.name || authUser.user_metadata?.name || "Mystic User",
    avatarUrl: profile?.avatarUrl || authUser.user_metadata?.avatar_url,
    isPremium: profile?.isPremium || false,
    isAdmin: profile?.isAdmin || false,
    preferences: profile?.preferences || {
      interests: [],
      notificationSettings: {
        dailyHoroscope: true,
        dailyTarot: true,
        newContent: true,
        premiumOffers: true,
      },
    },
    savedContent: profile?.savedContent || [],
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  justConfirmedEmailAndSignedIn: false,

  setJustConfirmedEmailAndSignedIn: (value: boolean) => {
    set({ justConfirmedEmailAndSignedIn: value });
  },

  updateUserProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) {
      throw new Error("No authenticated user");
    }

    set({ isLoading: true, error: null });
    try {
      const profileUpdates: { [key: string]: any } = {};
      if (updates.name) profileUpdates.full_name = updates.name;
      if (updates.avatarUrl) profileUpdates.avatar_url = updates.avatarUrl;

      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabase
          .from("user_profiles")
          .update(profileUpdates)
          .eq("id", user.id);

        if (error) throw error;
      }

      set({
        user: { ...user, ...updates },
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  hasPermission: (action: string) => {
    const { user } = get();
    if (!user) return false;

    if (user.isAdmin) return true;

    const permissions: { [key: string]: boolean } = {
      "create:birth_chart": true,
      "create:basic_report": true,
      "create:premium_report": !!user.isPremium,
      "create:vedic_report": !!user.isPremium,
      "create:compatibility_report": true,
      "export:pdf": !!user.isPremium,
      "access:advanced_features": !!user.isPremium,
      "manage:admin": !!user.isAdmin,
    };

    return permissions[action] || false;
  },

  isPremiumUser: () => {
    const { user } = get();
    return user?.isPremium || user?.isAdmin || false;
  },

  isAdminUser: () => {
    const { user } = get();
    return user?.isAdmin || false;
  },

  clearError: () => {
    set({ error: null });
  },

  fetchUserProfile: async (userId, authUserFromParam?: SupabaseUser | null) => {
    console.log(`[AuthStore] Fetching user profile for user ID: ${userId}`);
    if (!userId) {
      console.error('[AuthStore] Invalid user ID provided to fetchUserProfile');
      // Return default profile instead of throwing
      return get().createDefaultProfile('unknown');
    }

    try {
      // First try to find an existing profile
      console.log(`[AuthStore] Querying user_profiles table for ID: ${userId}`);
      let { data: profileData, error } = await supabase
        .from("user_profiles")
        .select('*') // Get all fields
        .eq("id", userId)
        .single();

      // Handle case where profile doesn't exist yet
      if (error) {
        console.log(`[AuthStore] Error or no profile for user ${userId}: ${error.message}`);
        
        // For any error, try to create a profile, but don't let errors block login
        try {
          console.log('[AuthStore] Attempting to create new profile');
          // Use authUserFromParam if provided, otherwise fetch it
          const supabaseAuthUser = authUserFromParam || (await supabase.auth.getUser())?.data?.user;

          if (supabaseAuthUser) {
            const { data: newProfile } = await supabase
              .from('user_profiles')
              .upsert({
                id: userId,
                username: supabaseAuthUser.email?.split('@')[0] || `user_${Date.now()}`,
                full_name: supabaseAuthUser.user_metadata?.full_name || 'Mystic User',
                avatar_url: supabaseAuthUser.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
              })
              .select('*')
              .single();
            
            console.log('[AuthStore] Profile creation attempt completed');
            if (newProfile) {
              profileData = newProfile;
              console.log('[AuthStore] Successfully created new profile');
            } else {
              // If we couldn't create, still return a default profile
              console.log('[AuthStore] Returning default profile');
              return get().createDefaultProfile(userId);
            }
          } else {
            // No auth user available, return default profile
            return get().createDefaultProfile(userId);
          }
        } catch (createError) {
          console.error('[AuthStore] Error creating profile:', createError);
          // Don't throw - return default profile instead
          return get().createDefaultProfile(userId);
        }
      }

      // If we made it here and still no profile data, return default
      if (!profileData) {
        console.warn('[AuthStore] No profile data, returning default');
        return get().createDefaultProfile(userId);
      }

      console.log('[AuthStore] Successfully retrieved/created user profile');
      // Map DB fields to our User type
      return {
        id: profileData.id,
        name: profileData.full_name || 'Mystic User',
        avatarUrl: profileData.avatar_url,
        isPremium: profileData.is_premium === true,
        isAdmin: profileData.is_admin === true, 
        preferences: profileData.preferences || { 
          interests: [], 
          notificationSettings: { 
            dailyHoroscope: true, 
            dailyTarot: true, 
            newContent: true, 
            premiumOffers: true 
          } 
        },
        savedContent: profileData.saved_content || [],
      };
    } catch (err) {
      console.error(`[AuthStore] Error in fetchUserProfile for user ${userId}:`, err);
      // Don't throw - return default profile instead
      return get().createDefaultProfile(userId);
    }
  },
  
  // Helper function to create default user profile
  createDefaultProfile: (userId: string): Partial<User> => {
    return {
      id: userId,
      name: 'Mystic User',
      avatarUrl: undefined,
      isPremium: false,
      isAdmin: false,
      preferences: { 
        interests: [], 
        notificationSettings: { 
          dailyHoroscope: true, 
          dailyTarot: true, 
          newContent: true, 
          premiumOffers: true 
        } 
      },
      savedContent: [],
    };
  },

  login: async (email, password): Promise<void> => {
    console.log('[AuthStore] Starting login process');
    set({ isLoading: true, error: null });
    
    try {
      console.log('[AuthStore] Validating inputs');
      // Basic validation
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email and password are required');
      }
      
      // Direct Supabase authentication - simplified approach
      console.log('[AuthStore] Making Supabase auth call');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Handle authentication errors
      if (signInError) {
        console.error('[AuthStore] Sign-in error:', signInError);
        throw signInError;
      }
      
      // Validate response
      if (!data?.user || !data?.session) {
        console.error('[AuthStore] Auth response missing user or session data');
        throw new Error('Authentication failed - missing user data');
      }
      
      console.log('[AuthStore] Authentication successful, user ID:', data.user.id);
      
      // Try to get user profile but don't let it block authentication
      let profile = null;
      try {
        console.log('[AuthStore] Fetching user profile');
        profile = await get().fetchUserProfile(data.user.id);
      } catch (profileError) {
        // Log but continue - we'll use default profile
        console.warn('[AuthStore] Profile fetch failed, using defaults:', profileError);
      }
      
      // Map user data
      const appUser = mapSupabaseUserToAppUser(data.user, profile);
      
      // Update state once with all user information
      console.log('[AuthStore] Setting authenticated state with user:', {
        id: appUser.id,
        hasProfile: !!profile,
        isAdmin: appUser.isAdmin
      });
      
      set({
        user: appUser,
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      console.log('[AuthStore] Login completed successfully');
      // No return value needed
      
    } catch (error: any) {
      console.error('[AuthStore] Login process failed:', error);
      set({
        error: error.message || "Invalid email or password",
        isLoading: false,
        user: null,
        session: null,
        isAuthenticated: false,
      });
      // No return value needed
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user && data.session) {
        const profile = await get().fetchUserProfile(data.user.id);
        const appUser = mapSupabaseUserToAppUser(data.user, profile);
        set({
          user: appUser,
          session: data.session,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else if (data.user && !data.session) {
        set({ isLoading: false, error: null });
        alert(
          "Registration successful! Please check your email to confirm your account.",
        );
      } else {
        throw new Error("Registration successful but no user data received.");
      }
    } catch (error: any) {
      set({
        error: error.message || "Registration failed. Please try again.",
        isLoading: false,
        user: null,
        session: null,
        isAuthenticated: false,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signOut();
    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        justConfirmedEmailAndSignedIn: false,
      });
    }
  },

  initializeAuth: () => {
    console.log('[AuthStore] Initializing authentication state');
    set({ isLoading: true });

    // First, check if we already have a session
    (async () => {
      try {
        console.log('[AuthStore] Checking for existing session');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthStore] Error getting session:', sessionError);
          set({ isLoading: false, error: sessionError.message });
          return;
        }

        if (session && session.user) {
          console.log('[AuthStore] Existing session found, fetching user profile');
          try {
            // We found an existing session, so fetch the user profile, passing the Supabase user object
            const profile = await get().fetchUserProfile(session.user.id, session.user);
            const appUser = mapSupabaseUserToAppUser(session.user, profile);
            
            console.log('[AuthStore] Successfully restored authenticated state');
            set({
              session,
              user: appUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (profileError) {
            console.error('[AuthStore] Error fetching profile during init:', profileError);
            set({ isLoading: false, error: 'Failed to restore your session' });
          }
        } else {
          console.log('[AuthStore] No existing session found');
          set({ isLoading: false });
        }
      } catch (err) {
        console.error('[AuthStore] Error during auth initialization:', err);
        set({ isLoading: false, error: 'Authentication initialization failed' });
      }
    })();

    // Set up listener for auth state changes
    console.log('[AuthStore] Setting up auth state change listener');
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AuthStore] Auth state change: ${event}`, {
          hasSession: !!session,
          hasUser: !!session?.user,
        });
        
        const currentState = get();
        const wasAuthenticatedBefore = currentState.isAuthenticated;

        try {
          if (event === "SIGNED_IN" && session && session.user) {
            console.log('[AuthStore] Processing SIGNED_IN event');
            set({ isLoading: true, error: null });
            try {
              // Pass session.user to fetchUserProfile
              const profile = await get().fetchUserProfile(session.user.id, session.user);
              const appUser = mapSupabaseUserToAppUser(session.user, profile);
              const isInitialSignInAfterConfirmation =
                !wasAuthenticatedBefore && !!session.user.email_confirmed_at;

              set({
                session,
                user: appUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                justConfirmedEmailAndSignedIn: isInitialSignInAfterConfirmation,
              });
              console.log('[AuthStore] SIGNED_IN event processed successfully');
            } catch (profileError) {
              console.error('[AuthStore] Error during SIGNED_IN profile fetch:', profileError);
              set({ 
                isLoading: false, 
                error: 'Failed to complete sign-in process',
                isAuthenticated: false,
                user: null,
                session: null,
              });
            }
          } else if (event === "SIGNED_OUT") {
            console.log('[AuthStore] Processing SIGNED_OUT event');
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              justConfirmedEmailAndSignedIn: false,
            });
          } else if (event === "USER_UPDATED" && session && session.user) {
            console.log('[AuthStore] Processing USER_UPDATED event');
            set({ isLoading: true, error: null });
            try {
              // Pass session.user to fetchUserProfile
              const profile = await get().fetchUserProfile(session.user.id, session.user);
              const appUser = mapSupabaseUserToAppUser(session.user, profile);
              set({
                session,
                user: appUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              console.log('[AuthStore] USER_UPDATED event processed successfully');
            } catch (profileError) {
              console.error('[AuthStore] Error during USER_UPDATED profile fetch:', profileError);
              // Don't clear the auth state on update errors, just log it
              set({ isLoading: false });
            }
          } else if (event === "PASSWORD_RECOVERY") {
            console.log('[AuthStore] Processing PASSWORD_RECOVERY event');
            set({ isLoading: false });
          } else if (event === "TOKEN_REFRESHED") {
            console.log('[AuthStore] Processing TOKEN_REFRESHED event');
            if (currentState.isAuthenticated && currentState.user) {
              set({ session, isLoading: false });
            }
          }
        } catch (err) {
          console.error("[AuthStore] Error in onAuthStateChange handler:", err);
          set({ isLoading: false });
        }
      },
    );

    return () => {
      console.log('[AuthStore] Cleaning up auth state change listener');
      authListener?.subscription.unsubscribe();
    };
  },
}));

useAuthStore.getState().initializeAuth();
