import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Ban,
  Activity,
  Download,
  Eye,
  MessageSquare,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useAdminSecurity } from "../AdminSecurityProvider";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in: string;
  is_admin: boolean;
  is_premium: boolean;
  subscription_status?: string;
  subscription_end_date?: string;
  avatar_url?: string;
  is_banned?: boolean;
  ban_reason?: string;
  last_activity?: string;
  total_logins?: number;
  subscription_plan?: string;
  subscription_revenue?: number;
  content_created?: number;
  reports_generated?: number;
}

interface UserFilters {
  role: "all" | "admin" | "premium" | "free";
  status: "all" | "active" | "inactive" | "banned";
  search: string;
  dateRange: "all" | "today" | "week" | "month" | "year";
  subscriptionStatus: "all" | "active" | "expired" | "cancelled";
}

const UserManagement: React.FC = () => {
  const { logAdminAction, hasPermission } = useAdminSecurity();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [userStats, setUserStats] = useState<any>(null);
  const [filters, setFilters] = useState<UserFilters>({
    role: "all",
    status: "all",
    search: "",
    dateRange: "all",
    subscriptionStatus: "all",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const fetchUserStats = async () => {
    try {
      const { data: stats, error } = await supabase.rpc("get_user_statistics");

      if (!error && stats) {
        setUserStats(stats);
      } else {
        // Fallback: calculate basic stats
        const totalUsers = users.length;
        const premiumUsers = users.filter((u) => u.is_premium).length;
        const adminUsers = users.filter((u) => u.is_admin).length;
        const activeUsers = users.filter((u) => {
          if (!u.last_activity) return false;
          const lastActivity = new Date(u.last_activity);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return lastActivity > weekAgo;
        }).length;

        setUserStats({
          total_users: totalUsers,
          premium_users: premiumUsers,
          admin_users: adminUsers,
          active_users: activeUsers,
          new_users_this_month: users.filter((u) => {
            const created = new Date(u.created_at);
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return created > monthAgo;
          }).length,
        });
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to get users from the auth.users view if available
      try {
        const { data: authUsers, error: authError } = await supabase
          .from("users")
          .select("*");

        if (!authError && authUsers && authUsers.length > 0) {
          // Successfully got auth users
          const transformedUsers = authUsers.map((user) => ({
            id: user.id,
            email: user.email || "No email",
            full_name: user.user_metadata?.full_name || "Unnamed User",
            created_at: user.created_at,
            last_sign_in: user.last_sign_in_at || "Never",
            is_admin: user.app_metadata?.is_admin || false,
            is_premium: user.app_metadata?.is_premium || false,
            subscription_status:
              user.app_metadata?.subscription_status || "none",
            subscription_end_date: user.app_metadata?.subscription_end_date,
          }));

          setUsers(transformedUsers);
          await fetchUserStats();
          return;
        }
      } catch (authErr) {
        console.log(
          "Could not fetch from auth.users view, falling back to profiles table",
        );
      }

      // Fallback: try to fetch from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      if (profiles && profiles.length > 0) {
        // Transform profile data to match UserProfile interface
        const transformedUsers = profiles.map((profile) => ({
          id: profile.id,
          email: profile.email || "No email",
          full_name: profile.full_name || "Unnamed User",
          created_at: profile.created_at,
          last_sign_in: profile.last_sign_in || "Never",
          is_admin: profile.is_admin || false,
          is_premium: profile.is_premium || false,
          subscription_status: "none", // Default value
          subscription_end_date: undefined,
        }));

        setUsers(transformedUsers);
        await fetchUserStats();
        return;
      }

      // If we reach here, no users were found
      setError("No users found in the database");
      setUsers([]);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Failed to load users: " + (err.message || "Unknown error"));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];

    // Apply role filter
    if (filters.role !== "all") {
      if (filters.role === "admin") {
        result = result.filter((user) => user.is_admin);
      } else if (filters.role === "premium") {
        result = result.filter((user) => user.is_premium);
      } else if (filters.role === "free") {
        result = result.filter((user) => !user.is_premium);
      }
    }

    // Apply status filter
    if (filters.status !== "all") {
      const now = new Date();
      if (filters.status === "active") {
        result = result.filter((user) => {
          if (!user.subscription_end_date) return false;
          return new Date(user.subscription_end_date) > now;
        });
      } else if (filters.status === "inactive") {
        result = result.filter((user) => {
          if (!user.subscription_end_date) return true;
          return new Date(user.subscription_end_date) <= now;
        });
      }
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.full_name.toLowerCase().includes(searchLower),
      );
    }

    setFilteredUsers(result);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  const openEditModal = (user: UserProfile) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setCurrentUser(null);
    setIsEditModalOpen(false);
  };

  const banUser = async (userId: string, reason: string) => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      // Log admin action
      await logAdminAction("ban_user", "user", userId, { reason });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, is_banned: true, ban_reason: reason }
            : user,
        ),
      );

      setSuccess("User banned successfully");
    } catch (err: any) {
      console.error("Error banning user:", err);
      setError(err.message || "Failed to ban user");
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: false,
          ban_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      // Log admin action
      await logAdminAction("unban_user", "user", userId);

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, is_banned: false, ban_reason: undefined }
            : user,
        ),
      );

      setSuccess("User unbanned successfully");
    } catch (err: any) {
      console.error("Error unbanning user:", err);
      setError(err.message || "Failed to unban user");
    }
  };

  const updateUserRole = async (userId: string, isAdmin: boolean) => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: isAdmin })
        .eq("id", userId);

      if (error) throw error;

      // Log admin action
      await logAdminAction(
        isAdmin ? "promote_to_admin" : "demote_from_admin",
        "user",
        userId,
      );

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_admin: isAdmin } : user,
        ),
      );

      setSuccess(
        `User role ${isAdmin ? "upgraded to admin" : "changed to regular user"} successfully`,
      );
    } catch (err: any) {
      console.error("Error updating user role:", err);
      setError(err.message || "Failed to update user role");
    }
  };

  const updateUserPremiumStatus = async (
    userId: string,
    isPremium: boolean,
  ) => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from("profiles")
        .update({ is_premium: isPremium })
        .eq("id", userId);

      if (error) throw error;

      // Log admin action
      await logAdminAction(
        isPremium ? "grant_premium" : "revoke_premium",
        "user",
        userId,
      );

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_premium: isPremium } : user,
        ),
      );

      setSuccess(
        `User premium status ${isPremium ? "enabled" : "disabled"} successfully`,
      );
    } catch (err: any) {
      console.error("Error updating premium status:", err);
      setError(err.message || "Failed to update premium status");
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      // In a real implementation, you would call an API endpoint that handles
      // both deleting the auth user and their profile data
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      // Log admin action
      await logAdminAction("delete_user", "user", userId);

      // Update local state
      setUsers(users.filter((user) => user.id !== userId));
      setSuccess("User deleted successfully");
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.message || "Failed to delete user");
    }
  };

  const saveUserChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: currentUser.full_name,
          is_admin: currentUser.is_admin,
          is_premium: currentUser.is_premium,
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      // Log admin action
      await logAdminAction("update_user", "user", currentUser.id, {
        name: currentUser.full_name,
        is_admin: currentUser.is_admin,
        is_premium: currentUser.is_premium,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === currentUser.id ? { ...user, ...currentUser } : user,
        ),
      );

      setSuccess("User updated successfully");
      closeEditModal();
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(err.message || "Failed to update user");
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0 || !bulkAction) return;

    try {
      setError(null);
      setSuccess(null);

      switch (bulkAction) {
        case "ban":
          const reason = prompt("Enter ban reason:");
          if (!reason) return;

          for (const userId of selectedUsers) {
            await banUser(userId, reason);
          }
          break;

        case "unban":
          for (const userId of selectedUsers) {
            await unbanUser(userId);
          }
          break;

        case "grant_premium":
          for (const userId of selectedUsers) {
            await updateUserPremiumStatus(userId, true);
          }
          break;

        case "revoke_premium":
          for (const userId of selectedUsers) {
            await updateUserPremiumStatus(userId, false);
          }
          break;
      }

      setSelectedUsers([]);
      setBulkAction("");
      setIsBulkActionModalOpen(false);
      setSuccess(`Bulk action completed for ${selectedUsers.length} users`);
    } catch (err: any) {
      setError(err.message || "Bulk action failed");
    }
  };

  const exportUserData = async () => {
    try {
      const csvContent = [
        [
          "ID",
          "Email",
          "Name",
          "Created At",
          "Last Sign In",
          "Is Admin",
          "Is Premium",
          "Subscription Status",
        ].join(","),
        ...filteredUsers.map((user) =>
          [
            user.id,
            user.email,
            user.full_name,
            user.created_at,
            user.last_sign_in,
            user.is_admin,
            user.is_premium,
            user.subscription_status || "none",
          ].join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      await logAdminAction("export_user_data", "system", "user_export");
    } catch (err) {
      setError("Failed to export user data");
    }
  };

  // Check admin permissions
  if (!hasPermission("manage:users")) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
        <p className="text-gray-400">
          You don't have permission to manage users.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-t-accent-500 border-r-accent-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">User Management</h2>
          {userStats && (
            <div className="flex space-x-6 mt-2 text-sm text-gray-400">
              <span>Total: {userStats.total_users}</span>
              <span>Premium: {userStats.premium_users}</span>
              <span>Active: {userStats.active_users}</span>
              <span>New this month: {userStats.new_users_this_month}</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportUserData}
            className="flex items-center px-4 py-2 bg-dark-600 hover:bg-dark-500 rounded-md text-white font-medium transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setIsBulkActionModalOpen(true)}
              className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-white font-medium transition-colors"
            >
              Bulk Actions ({selectedUsers.length})
            </button>
          )}
          <button
            onClick={() => alert("User invitation would be implemented here")}
            className="flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors"
          >
            <UserPlus size={16} className="mr-2" />
            Invite User
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-900/30 border border-red-800 rounded-md flex items-start">
          <AlertTriangle
            size={20}
            className="text-red-400 mr-2 mt-0.5 flex-shrink-0"
          />
          <p className="text-white">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 mb-6 bg-green-900/30 border border-green-800 rounded-md flex items-start">
          <Check
            size={20}
            className="text-green-400 mr-2 mt-0.5 flex-shrink-0"
          />
          <p className="text-white">{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-dark-700 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder="Search users..."
                className="w-full pl-10 p-2.5 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-40">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
                <select
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  className="w-full pl-10 p-2.5 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="premium">Premium</option>
                  <option value="free">Free Users</option>
                </select>
              </div>
            </div>

            <div className="w-40">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full pl-10 p-2.5 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-700 rounded-lg overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">
              No users found matching your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-600">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-600/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-accent-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-lg">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        {user.is_admin && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-900/30 text-purple-400">
                            Admin
                          </span>
                        )}
                        {user.is_premium ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-green-400 mt-1">
                            Premium
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-dark-500 text-gray-400 mt-1">
                            Free
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.last_sign_in === "Never"
                        ? "Never"
                        : new Date(user.last_sign_in).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() =>
                            updateUserRole(user.id, !user.is_admin)
                          }
                          className={`p-1.5 rounded ${user.is_admin ? "bg-purple-900/30 text-purple-400" : "bg-dark-600 text-gray-300"} hover:bg-dark-500 hover:text-white transition-colors`}
                          title={
                            user.is_admin ? "Remove admin role" : "Make admin"
                          }
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          onClick={() =>
                            updateUserPremiumStatus(user.id, !user.is_premium)
                          }
                          className={`p-1.5 rounded ${user.is_premium ? "bg-green-900/30 text-green-400" : "bg-dark-600 text-gray-300"} hover:bg-dark-500 hover:text-white transition-colors`}
                          title={
                            user.is_premium
                              ? "Remove premium status"
                              : "Make premium"
                          }
                        >
                          {user.is_premium ? (
                            <UserCheck size={16} />
                          ) : (
                            <UserX size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 bg-dark-600 hover:bg-dark-500 rounded text-gray-300 hover:text-white transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1.5 bg-dark-600 hover:bg-red-900 rounded text-gray-300 hover:text-white transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && currentUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark-700 rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-white">Edit User</h3>
              <button
                onClick={closeEditModal}
                className="p-1 bg-dark-600 hover:bg-dark-500 rounded text-gray-300 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveUserChanges}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={currentUser.full_name}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={currentUser.email}
                    disabled
                    className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_admin"
                    checked={currentUser.is_admin}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        is_admin: e.target.checked,
                      })
                    }
                    className="w-5 h-5 bg-dark-700 border border-dark-600 rounded text-accent-600 focus:ring-accent-500"
                  />
                  <label
                    htmlFor="is_admin"
                    className="ml-2 text-white font-medium"
                  >
                    Admin User
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_premium"
                    checked={currentUser.is_premium}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        is_premium: e.target.checked,
                      })
                    }
                    className="w-5 h-5 bg-dark-700 border border-dark-600 rounded text-accent-600 focus:ring-accent-500"
                  />
                  <label
                    htmlFor="is_premium"
                    className="ml-2 text-white font-medium"
                  >
                    Premium User
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-dark-600 hover:bg-dark-500 rounded-md text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
