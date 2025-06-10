import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";

interface AdminSecurityContextType {
  isSecureSession: boolean;
  sessionExpiry: Date | null;
  refreshSession: () => Promise<void>;
  logAdminAction: (
    action: string,
    targetType: string,
    targetId?: string,
    details?: any,
  ) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AdminSecurityContext = createContext<AdminSecurityContextType | null>(
  null,
);

export const useAdminSecurity = () => {
  const context = useContext(AdminSecurityContext);
  if (!context) {
    throw new Error(
      "useAdminSecurity must be used within AdminSecurityProvider",
    );
  }
  return context;
};

interface AdminSecurityProviderProps {
  children: React.ReactNode;
}

export const AdminSecurityProvider: React.FC<AdminSecurityProviderProps> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [isSecureSession, setIsSecureSession] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      initializeSecureSession();
    }
  }, [isAuthenticated, user]);

  const initializeSecureSession = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        // Create or update admin session
        const expiryTime = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours

        const { error } = await supabase.from("admin_sessions").upsert({
          admin_id: user!.id,
          session_token: session.session.access_token,
          expires_at: expiryTime.toISOString(),
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent,
          is_active: true,
          last_activity: new Date().toISOString(),
        });

        if (!error) {
          setIsSecureSession(true);
          setSessionExpiry(expiryTime);

          // Log admin login
          await logAdminAction(
            "admin_login",
            "session",
            session.session.access_token,
          );
        }
      }
    } catch (error) {
      console.error("Failed to initialize secure admin session:", error);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data.session) {
        await initializeSecureSession();
      }
    } catch (error) {
      console.error("Failed to refresh admin session:", error);
    }
  };

  const logAdminAction = async (
    action: string,
    targetType: string,
    targetId?: string,
    details?: any,
  ) => {
    if (!user?.isAdmin) return;

    try {
      await supabase.rpc("log_admin_action", {
        p_admin_id: user.id,
        p_action: action,
        p_target_type: targetType,
        p_target_id: targetId,
        p_details: details,
      });
    } catch (error) {
      console.error("Failed to log admin action:", error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.isAdmin) return false;

    // Always grant all permissions to admin users
    // This ensures admins can access all features including user management
    return true;

    // In a more sophisticated system, you might implement granular permissions:
    /*
    const permissionMap = {
      'manage_users': true,
      'manage_content': true,
      'manage_settings': true,
      // Add more permissions as needed
    };
    
    return permissionMap[permission] === true;
    */
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch {
      return "unknown";
    }
  };

  const value: AdminSecurityContextType = {
    isSecureSession,
    sessionExpiry,
    refreshSession,
    logAdminAction,
    hasPermission,
  };

  return (
    <AdminSecurityContext.Provider value={value}>
      {children}
    </AdminSecurityContext.Provider>
  );
};
