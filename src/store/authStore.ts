import { create } from "zustand";
import { User, UserPreferences } from "../types";
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

  // Profile management
  fetchUserProfile: (userId: string) => Promise<Partial<User> | null>;
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
      const { error } = await supabase
        .from("profiles")
        .update({
          name: updates.name,
          avatar_url: updates.avatarUrl,
          preferences: updates.preferences,
          saved_content: updates.savedContent,
        })
        .eq("id", user.id);

      if (error) throw error;

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

    // Admin has all permissions
    if (user.isAdmin) return true;

    // Define permission rules
    const permissions: { [key: string]: boolean } = {
      "create:birth_chart": true, // All authenticated users
      "create:basic_report": true, // All authenticated users
      "create:premium_report": user.isPremium, // Premium users only
      "create:vedic_report": user.isPremium, // Premium users only
      "create:compatibility_report": true, // All authenticated users
      "export:pdf": user.isPremium, // Premium users only
      "access:advanced_features": user.isPremium, // Premium users only
      "manage:admin": user.isAdmin, // Admin only
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

  fetchUserProfile: async (userId: string): Promise<Partial<User> | null> => {
    console.log("[AuthStore] fetchUserProfile called for userId:", userId);

    try {
      // Set a timeout to prevent hanging indefinitely
      const timeoutPromise = new Promise<{ data: null; error: Error }>(
        (_, reject) => {
          setTimeout(() => {
            reject(new Error("Profile fetch timed out after 5 seconds"));
          }, 5000);
        },
      );

      // The actual fetch request
      const fetchPromise = supabase
        .from("profiles")
        .select(
          "name, avatar_url, is_premium, preferences, saved_content, is_admin",
        )
        .eq("id", userId)
        .single();

      // Race between the timeout and the actual fetch
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]);

      console.log("[AuthStore] fetchUserProfile result:", { data, error });

      if (error) {
        console.error("[AuthStore] Error fetching user profile:", error);
        // Return a default profile with minimal data to prevent login failures
        return {
          name: "User",
          avatarUrl: undefined, // Changed from null to undefined to match type
          isPremium: false,
          isAdmin: false, // Default to non-admin for safety
          preferences: {
            interests: [],
            notificationSettings: {
              dailyHoroscope: true,
              dailyTarot: true,
              newContent: true,
              premiumOffers: true,
            },
          },
          savedContent: [],
        };
      }

      if (data) {
        console.log("[AuthStore] Profile data fetched:", data);
        return {
          name: data.name,
          avatarUrl: data.avatar_url,
          isPremium: data.is_premium,
          isAdmin: data.is_admin,
          preferences: data.preferences as UserPreferences,
          savedContent: data.saved_content || [],
        };
      }

      console.log("[AuthStore] No profile data found for userId:", userId);
      // Return a default profile with minimal data
      return {
        name: "User",
        avatarUrl: undefined, // Changed from null to undefined to match type
        isPremium: false,
        isAdmin: false,
        preferences: {
          interests: [],
          notificationSettings: {
            dailyHoroscope: true,
            dailyTarot: true,
            newContent: true,
            premiumOffers: true,
          },
        },
        savedContent: [],
      };
    } catch (error) {
      console.error("[AuthStore] Exception in fetchUserProfile:", error);
      // Return a default profile with minimal data to prevent login failures
      return {
        name: "User",
        avatarUrl: undefined, // Changed from null to undefined to match type
        isPremium: false,
        isAdmin: false,
        preferences: {
          interests: [],
          notificationSettings: {
            dailyHoroscope: true,
            dailyTarot: true,
            newContent: true,
            premiumOffers: true,
          },
        },
        savedContent: [],
      };
    }
  },

  login: async (email, password) => {
    console.log("[AuthStore] login attempt for email:", email);
    set({ isLoading: true, error: null });
    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      console.log("[AuthStore] signInWithPassword result:", {
        data,
        signInError,
      });

      if (signInError) throw signInError;

      if (data.user && data.session) {
        console.log(
          "[AuthStore] Login successful, fetching profile for user:",
          data.user.id,
        );
        const profile = await get().fetchUserProfile(data.user.id);
        console.log("[AuthStore] Profile fetched in login:", profile);
        const appUser = mapSupabaseUserToAppUser(data.user, profile);
        set({
          user: appUser,
          session: data.session,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        console.log("[AuthStore] Login state updated, user authenticated.");
      } else {
        console.error(
          "[AuthStore] Login: No user data/session received after signInWithPassword.",
        );
        throw new Error("Login successful but no user data received.");
      }
    } catch (error: any) {
      console.error("[AuthStore] Login error caught:", error);
      set({
        error: error.message || "Invalid email or password",
        isLoading: false,
        user: null,
        session: null,
        isAuthenticated: false,
      });
    }
  },

  register: async (name, email, password) => {
    console.log("[AuthStore] register attempt for email:", email);
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
      console.log("[AuthStore] signUp result:", { data, signUpError });

      if (signUpError) throw signUpError;

      if (data.user && data.session) {
        console.log(
          "[AuthStore] Registration successful, fetching profile for user:",
          data.user.id,
        );
        const profile = await get().fetchUserProfile(data.user.id);
        console.log("[AuthStore] Profile fetched in registration:", profile);
        const appUser = mapSupabaseUserToAppUser(data.user, profile);
        set({
          user: appUser,
          session: data.session,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        console.log(
          "[AuthStore] Registration state updated, user authenticated.",
        );
      } else if (data.user && !data.session) {
        console.log(
          "[AuthStore] Registration successful, but no session received.",
        );
        set({ isLoading: false, error: null });
        alert(
          "Registration successful! Please check your email to confirm your account.",
        );
      } else {
        console.error(
          "[AuthStore] Registration: No user data/session received after signUp.",
        );
        throw new Error("Registration successful but no user data received.");
      }
    } catch (error: any) {
      console.error("[AuthStore] Registration error caught:", error);
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
    console.log("[AuthStore] logout attempt");
    set({ isLoading: true });
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[AuthStore] Logout error:", error);
      set({ error: error.message, isLoading: false });
    } else {
      console.log("[AuthStore] Logout successful");
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
    console.log("[AuthStore] initializeAuth called");

    // Don't set loading to true initially to prevent redirect issues
    set({ isLoading: false });

    // Set a shorter timeout to prevent hanging during initialization
    const initTimeout = setTimeout(() => {
      console.log("[AuthStore] initializeAuth timeout reached");
      set({ isLoading: false });
    }, 2000);

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        console.log("[AuthStore] initializeAuth getSession result:", session);

        try {
          if (session && session.user) {
            // Don't set loading to true to prevent redirect issues
            const wasAuthenticatedBefore = get().isAuthenticated;
            console.log(
              "[AuthStore] initializeAuth: session exists, wasAuthenticatedBefore:",
              wasAuthenticatedBefore,
              "email_confirmed_at:",
              session.user.email_confirmed_at,
            );

            // Set a shorter timeout for profile fetching
            const profilePromise = get().fetchUserProfile(session.user.id);
            const timeoutPromise = new Promise<null>((_, reject) => {
              setTimeout(() => {
                reject(new Error("Profile fetch timed out"));
              }, 2000);
            });

            // Race between profile fetch and timeout
            const profile = await Promise.race([
              profilePromise,
              timeoutPromise,
            ]).catch((err) => {
              console.error("[AuthStore] Error fetching profile:", err);
              return null;
            });

            console.log(
              "[AuthStore] initializeAuth: profile fetched:",
              profile,
            );
            const appUser = mapSupabaseUserToAppUser(session.user, profile);

            // Only set redirect flag for actual email confirmations
            const isEmailConfirmation =
              !wasAuthenticatedBefore &&
              session.user.email_confirmed_at &&
              session.user.confirmed_at;

            set({
              session,
              user: appUser,
              isAuthenticated: true,
              isLoading: false,
              justConfirmedEmailAndSignedIn: isEmailConfirmation,
            });
          } else {
            console.log("[AuthStore] initializeAuth: no session found.");
            set({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              session: null,
            });
          }
        } catch (err) {
          console.error("[AuthStore] Error in initializeAuth:", err);
          set({ isLoading: false });
        } finally {
          clearTimeout(initTimeout);
        }
      })
      .catch((err) => {
        console.error("[AuthStore] Error getting session:", err);
        set({ isLoading: false });
        clearTimeout(initTimeout);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          "[AuthStore] onAuthStateChange event:",
          event,
          "session:",
          session ? "exists" : "null",
        );
        const currentState = get();
        const wasAuthenticatedBefore = currentState.isAuthenticated;
        console.log(
          "[AuthStore] onAuthStateChange: wasAuthenticatedBefore:",
          wasAuthenticatedBefore,
        );

        // Set a timeout to prevent hanging during auth state changes
        const stateChangeTimeout = setTimeout(() => {
          console.log(
            "[AuthStore] onAuthStateChange timeout reached for event:",
            event,
          );
          set({ isLoading: false });
        }, 5000);

        try {
          if (event === "SIGNED_IN" && session && session.user) {
            set({ isLoading: true, error: null }); // Indicate loading has started
            console.log(
              "[AuthStore] onAuthStateChange: SIGNED_IN event, email_confirmed_at:",
              session.user.email_confirmed_at,
            );

            // Set a timeout for profile fetching
            const profilePromise = get().fetchUserProfile(session.user.id);
            const timeoutPromise = new Promise<null>((_, reject) => {
              setTimeout(() => {
                reject(
                  new Error("Profile fetch timed out during auth state change"),
                );
              }, 3000);
            });

            // Race between profile fetch and timeout
            const profile = await Promise.race([
              profilePromise,
              timeoutPromise,
            ]).catch((err) => {
              console.error(
                "[AuthStore] Error fetching profile during auth state change:",
                err,
              );
              return null;
            });

            console.log(
              "[AuthStore] onAuthStateChange SIGNED_IN: profile fetched:",
              profile ? "exists" : "null",
            );
            const appUser = mapSupabaseUserToAppUser(session.user, profile);
            const isInitialSignInAfterConfirmation =
              !wasAuthenticatedBefore && !!session.user.email_confirmed_at;
            console.log(
              "[AuthStore] onAuthStateChange SIGNED_IN: isInitialSignInAfterConfirmation flag:",
              isInitialSignInAfterConfirmation,
            );

            set({
              session,
              user: appUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              justConfirmedEmailAndSignedIn: isInitialSignInAfterConfirmation,
            });
          } else if (event === "SIGNED_OUT") {
            console.log("[AuthStore] onAuthStateChange: SIGNED_OUT event");
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              justConfirmedEmailAndSignedIn: false,
            });
          } else if (event === "USER_UPDATED" && session && session.user) {
            set({ isLoading: true, error: null }); // Indicate loading has started
            console.log(
              "[AuthStore] onAuthStateChange: USER_UPDATED event, email_confirmed_at:",
              session.user.email_confirmed_at,
            );

            // Set a timeout for profile fetching
            const profilePromise = get().fetchUserProfile(session.user.id);
            const timeoutPromise = new Promise<null>((_, reject) => {
              setTimeout(() => {
                reject(new Error("Profile fetch timed out during user update"));
              }, 3000);
            });

            // Race between profile fetch and timeout
            const profile = await Promise.race([
              profilePromise,
              timeoutPromise,
            ]).catch((err) => {
              console.error(
                "[AuthStore] Error fetching profile during user update:",
                err,
              );
              return null;
            });

            console.log(
              "[AuthStore] onAuthStateChange USER_UPDATED: profile fetched:",
              profile ? "exists" : "null",
            );
            const appUser = mapSupabaseUserToAppUser(session.user, profile);
            set({
              session,
              user: appUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else if (event === "PASSWORD_RECOVERY") {
            console.log(
              "[AuthStore] onAuthStateChange: PASSWORD_RECOVERY event",
            );
            set({ isLoading: false });
          } else if (event === "TOKEN_REFRESHED") {
            console.log("[AuthStore] onAuthStateChange: TOKEN_REFRESHED event");
            // Only update the session, preserve other state
            if (currentState.isAuthenticated && currentState.user) {
              set({ session, isLoading: false });
            }
          }
        } catch (err) {
          console.error("[AuthStore] Error in onAuthStateChange handler:", err);
          set({ isLoading: false });
        } finally {
          clearTimeout(stateChangeTimeout);
        }
      },
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  },
}));

useAuthStore.getState().initializeAuth();
