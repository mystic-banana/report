import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertTriangle,
  DollarSign,
  Crown,
  Star,
  Zap,
  Check,
  Moon,
  Calendar,
  TrendingUp,
  BookOpen,
  Users,
  Sparkles,
} from "lucide-react";
import Button from "../../ui/Button";
import { Switch } from "../../ui/Switch";
import LoadingSpinner from "../../ui/LoadingSpinner";

interface AstrologyFeatures {
  birth_charts_limit: number | null; // null means unlimited
  compatibility_reports_limit: number | null;
  daily_horoscopes: boolean;
  transit_forecasts: boolean;
  premium_reports: boolean;
  ai_interpretations: boolean;
  chart_sharing: boolean;
  priority_support: boolean;
  advanced_aspects: boolean;
  yearly_forecasts: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "monthly" | "yearly";
  features: string[];
  astrology_features: AstrologyFeatures;
  is_active: boolean;
  is_popular: boolean;
  stripe_price_id?: string;
  created_at: string;
  updated_at: string;
}

const defaultAstrologyFeatures: AstrologyFeatures = {
  birth_charts_limit: 1,
  compatibility_reports_limit: 1,
  daily_horoscopes: true,
  transit_forecasts: false,
  premium_reports: false,
  ai_interpretations: false,
  chart_sharing: false,
  priority_support: false,
  advanced_aspects: false,
  yearly_forecasts: false,
};

const defaultPlan: Omit<SubscriptionPlan, "id" | "created_at" | "updated_at"> =
  {
    name: "",
    description: "",
    price: 0,
    currency: "USD",
    interval: "monthly",
    features: [],
    astrology_features: defaultAstrologyFeatures,
    is_active: true,
    is_popular: false,
    stripe_price_id: "",
  };

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [currentPlan, setCurrentPlan] =
    useState<Omit<SubscriptionPlan, "id" | "created_at" | "updated_at">>(
      defaultPlan,
    );
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price");

      if (error) throw error;

      setPlans(data || []);
    } catch (err: any) {
      console.error("Error fetching plans:", err);
      setError("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const startAddPlan = () => {
    setCurrentPlan(defaultPlan);
    setIsAddingPlan(true);
    setEditingPlan(null);
    setError(null);
    setSuccess(null);
  };

  const startEditPlan = (plan: SubscriptionPlan) => {
    const { id, created_at, updated_at, ...planData } = plan;
    setCurrentPlan(planData);
    setEditingPlan(id);
    setIsAddingPlan(false);
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setIsAddingPlan(false);
    setEditingPlan(null);
    setCurrentPlan(defaultPlan);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    setCurrentPlan({
      ...currentPlan,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseFloat(value)
            : value,
    });
  };

  const handleAstrologyFeatureChange = (
    feature: keyof AstrologyFeatures,
    value: boolean | number | null,
  ) => {
    setCurrentPlan({
      ...currentPlan,
      astrology_features: {
        ...currentPlan.astrology_features,
        [feature]: value,
      },
    });
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;

    setCurrentPlan({
      ...currentPlan,
      features: [...currentPlan.features, newFeature.trim()],
    });

    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    setCurrentPlan({
      ...currentPlan,
      features: currentPlan.features.filter((_, i) => i !== index),
    });
  };

  const savePlan = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Validate plan data
      if (!currentPlan.name.trim()) {
        setError("Plan name is required");
        return;
      }

      if (currentPlan.price < 0) {
        setError("Price cannot be negative");
        return;
      }

      const timestamp = new Date().toISOString();
      const planData = {
        name: currentPlan.name,
        description: currentPlan.description,
        price: currentPlan.price,
        currency: currentPlan.currency,
        interval: currentPlan.interval,
        features: currentPlan.features,
        astrology_features: currentPlan.astrology_features,
        is_active: currentPlan.is_active,
        is_popular: currentPlan.is_popular,
        stripe_price_id: currentPlan.stripe_price_id,
      };

      if (isAddingPlan) {
        // Add new plan
        const { data, error } = await supabase
          .from("subscription_plans")
          .insert({
            ...planData,
            created_at: timestamp,
            updated_at: timestamp,
          })
          .select()
          .single();

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }

        setPlans([...plans, data]);
        setSuccess("Plan added successfully");
      } else if (editingPlan) {
        // Update existing plan
        const { data, error } = await supabase
          .from("subscription_plans")
          .update({
            ...planData,
            updated_at: timestamp,
          })
          .eq("id", editingPlan)
          .select()
          .single();

        if (error) {
          console.error("Update error:", error);
          throw error;
        }

        setPlans(plans.map((plan) => (plan.id === editingPlan ? data : plan)));
        setSuccess("Plan updated successfully");
      }

      // Reset form
      cancelEdit();
    } catch (err: any) {
      console.error("Error saving plan:", err);
      setError(err.message || "Failed to save plan");
    }
  };

  const deletePlan = async (planId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this plan? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setError(null);

      // First check if any users are subscribed to this plan
      const { data: subscribers, error: checkError } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("plan_id", planId)
        .limit(1);

      if (checkError) throw checkError;

      if (subscribers && subscribers.length > 0) {
        setError(
          "Cannot delete this plan because users are currently subscribed to it. Deactivate it instead.",
        );
        return;
      }

      // Delete the plan
      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;

      setPlans(plans.filter((plan) => plan.id !== planId));
      setSuccess("Plan deleted successfully");
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      setError(err.message || "Failed to delete plan");
    }
  };

  const togglePlanStatus = async (plan: SubscriptionPlan) => {
    try {
      setError(null);

      const { error } = await supabase
        .from("subscription_plans")
        .update({
          is_active: !plan.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", plan.id);

      if (error) throw error;

      setPlans(
        plans.map((p) =>
          p.id === plan.id ? { ...p, is_active: !p.is_active } : p,
        ),
      );

      setSuccess(
        `Plan ${plan.is_active ? "deactivated" : "activated"} successfully`,
      );
    } catch (err: any) {
      console.error("Error toggling plan status:", err);
      setError(err.message || "Failed to update plan status");
    }
  };

  const createDefaultPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const defaultPlans = [
        {
          name: "Free",
          description: "Perfect for exploring astrology basics",
          price: 0,
          currency: "USD",
          interval: "monthly" as const,
          features: [
            "Basic birth chart generation",
            "Daily horoscopes for all signs",
            "Community access",
            "Basic compatibility analysis",
            "Monthly newsletter",
          ],
          astrology_features: {
            birth_charts_limit: 1,
            compatibility_reports_limit: 1,
            daily_horoscopes: true,
            transit_forecasts: false,
            premium_reports: false,
            ai_interpretations: false,
            chart_sharing: false,
            priority_support: false,
            advanced_aspects: false,
            yearly_forecasts: false,
          },
          is_active: true,
          is_popular: false,
        },
        {
          name: "Premium",
          description: "Comprehensive astrology insights and analysis",
          price: 19.99,
          currency: "USD",
          interval: "monthly" as const,
          features: [
            "Unlimited birth charts",
            "Advanced compatibility reports",
            "Personalized daily horoscopes",
            "Transit forecasts and timing",
            "AI-powered interpretations",
            "Chart sharing and collaboration",
            "Priority customer support",
            "Advanced aspect analysis",
            "Yearly forecast reports",
            "Premium content access",
          ],
          astrology_features: {
            birth_charts_limit: null, // unlimited
            compatibility_reports_limit: null, // unlimited
            daily_horoscopes: true,
            transit_forecasts: true,
            premium_reports: true,
            ai_interpretations: true,
            chart_sharing: true,
            priority_support: true,
            advanced_aspects: true,
            yearly_forecasts: true,
          },
          is_active: true,
          is_popular: true,
        },
        {
          name: "Professional",
          description: "For astrology professionals and serious practitioners",
          price: 49.99,
          currency: "USD",
          interval: "monthly" as const,
          features: [
            "Everything in Premium",
            "White-label chart generation",
            "Client management system",
            "Bulk chart processing",
            "API access for integrations",
            "Custom branding options",
            "Advanced reporting tools",
            "Professional consultation features",
            "Priority feature requests",
          ],
          astrology_features: {
            birth_charts_limit: null, // unlimited
            compatibility_reports_limit: null, // unlimited
            daily_horoscopes: true,
            transit_forecasts: true,
            premium_reports: true,
            ai_interpretations: true,
            chart_sharing: true,
            priority_support: true,
            advanced_aspects: true,
            yearly_forecasts: true,
          },
          is_active: true,
          is_popular: false,
        },
      ];

      const timestamp = new Date().toISOString();
      const plansToInsert = defaultPlans.map((plan) => ({
        ...plan,
        created_at: timestamp,
        updated_at: timestamp,
      }));

      const { data, error } = await supabase
        .from("subscription_plans")
        .insert(plansToInsert)
        .select();

      if (error) throw error;

      setPlans(data || []);
      setSuccess("Default plans created successfully");
    } catch (err: any) {
      console.error("Error creating default plans:", err);
      setError(err.message || "Failed to create default plans");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-dark-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Astrology Subscription Plans
          </h2>
          <p className="text-gray-400">
            Manage premium and free plan options for astrology features
          </p>
        </div>
        <div className="flex space-x-2">
          {plans.length === 0 && (
            <Button
              onClick={createDefaultPlans}
              variant="outline"
              icon={Sparkles}
            >
              Create Default Plans
            </Button>
          )}
          <Button
            onClick={startAddPlan}
            icon={Plus}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            Add New Plan
          </Button>
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
        <div className="p-4 mb-6 bg-green-900/30 border border-green-800 rounded-md">
          <p className="text-white">{success}</p>
        </div>
      )}

      {/* Plan Editor */}
      {(isAddingPlan || editingPlan) && (
        <div className="bg-dark-800 rounded-lg p-6 mb-8 border border-dark-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-white">
              {isAddingPlan ? "Add New Plan" : "Edit Plan"}
            </h3>
            <button
              onClick={cancelEdit}
              className="p-2 bg-dark-700 hover:bg-dark-600 rounded text-gray-300 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Plan Info */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-white border-b border-dark-600 pb-2">
                Basic Information
              </h4>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Plan Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentPlan.name}
                  onChange={handleInputChange}
                  placeholder="Premium Plan"
                  className="w-full p-3 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={currentPlan.description}
                  onChange={handleInputChange}
                  placeholder="Comprehensive astrology insights and analysis"
                  rows={3}
                  className="w-full p-3 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={currentPlan.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full p-3 pl-10 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="interval"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Billing Interval
                  </label>
                  <select
                    id="interval"
                    name="interval"
                    value={currentPlan.interval}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="stripe_price_id"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Stripe Price ID
                </label>
                <input
                  type="text"
                  id="stripe_price_id"
                  name="stripe_price_id"
                  value={currentPlan.stripe_price_id || ""}
                  onChange={handleInputChange}
                  placeholder="price_1234567890"
                  className="w-full p-3 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Switch
                      checked={currentPlan.is_active}
                      onCheckedChange={(checked) =>
                        setCurrentPlan({ ...currentPlan, is_active: checked })
                      }
                    />
                    <label className="ml-2 text-white font-medium">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      checked={currentPlan.is_popular}
                      onCheckedChange={(checked) =>
                        setCurrentPlan({ ...currentPlan, is_popular: checked })
                      }
                    />
                    <label className="ml-2 text-white font-medium">
                      Popular
                    </label>
                  </div>
                </div>
              </div>

              {/* General Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  General Features
                </label>
                <div className="flex mb-3">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    className="flex-1 p-3 bg-dark-700 border border-dark-600 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === "Enter" && addFeature()}
                  />
                  <button
                    onClick={addFeature}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-r-md text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="bg-dark-700 rounded-md p-3 min-h-[120px] max-h-[200px] overflow-y-auto">
                  {currentPlan.features.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">
                      No features added yet
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {currentPlan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-2 bg-dark-600 rounded-md"
                        >
                          <span className="text-white text-sm">{feature}</span>
                          <button
                            onClick={() => removeFeature(index)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Astrology Features */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-white border-b border-dark-600 pb-2 flex items-center">
                <Star className="w-5 h-5 mr-2 text-purple-400" />
                Astrology Features
              </h4>

              {/* Birth Charts Limit */}
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Moon className="w-5 h-5 mr-2 text-blue-400" />
                    <span className="text-white font-medium">Birth Charts</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="birth_charts_type"
                      checked={
                        currentPlan.astrology_features.birth_charts_limit !==
                        null
                      }
                      onChange={() =>
                        handleAstrologyFeatureChange("birth_charts_limit", 1)
                      }
                      className="mr-2"
                    />
                    <span className="text-gray-300">Limited</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="birth_charts_type"
                      checked={
                        currentPlan.astrology_features.birth_charts_limit ===
                        null
                      }
                      onChange={() =>
                        handleAstrologyFeatureChange("birth_charts_limit", null)
                      }
                      className="mr-2"
                    />
                    <span className="text-gray-300">Unlimited</span>
                  </label>
                </div>
                {currentPlan.astrology_features.birth_charts_limit !== null && (
                  <input
                    type="number"
                    min="0"
                    value={
                      currentPlan.astrology_features.birth_charts_limit || 0
                    }
                    onChange={(e) =>
                      handleAstrologyFeatureChange(
                        "birth_charts_limit",
                        parseInt(e.target.value),
                      )
                    }
                    className="mt-2 w-24 p-2 bg-dark-600 border border-dark-500 rounded text-white"
                    placeholder="Limit"
                  />
                )}
              </div>

              {/* Compatibility Reports Limit */}
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-pink-400" />
                    <span className="text-white font-medium">
                      Compatibility Reports
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="compatibility_reports_type"
                      checked={
                        currentPlan.astrology_features
                          .compatibility_reports_limit !== null
                      }
                      onChange={() =>
                        handleAstrologyFeatureChange(
                          "compatibility_reports_limit",
                          1,
                        )
                      }
                      className="mr-2"
                    />
                    <span className="text-gray-300">Limited</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="compatibility_reports_type"
                      checked={
                        currentPlan.astrology_features
                          .compatibility_reports_limit === null
                      }
                      onChange={() =>
                        handleAstrologyFeatureChange(
                          "compatibility_reports_limit",
                          null,
                        )
                      }
                      className="mr-2"
                    />
                    <span className="text-gray-300">Unlimited</span>
                  </label>
                </div>
                {currentPlan.astrology_features.compatibility_reports_limit !==
                  null && (
                  <input
                    type="number"
                    min="0"
                    value={
                      currentPlan.astrology_features
                        .compatibility_reports_limit || 0
                    }
                    onChange={(e) =>
                      handleAstrologyFeatureChange(
                        "compatibility_reports_limit",
                        parseInt(e.target.value),
                      )
                    }
                    className="mt-2 w-24 p-2 bg-dark-600 border border-dark-500 rounded text-white"
                    placeholder="Limit"
                  />
                )}
              </div>

              {/* Boolean Features */}
              <div className="space-y-4">
                {[
                  {
                    key: "daily_horoscopes",
                    label: "Daily Horoscopes",
                    icon: Calendar,
                    color: "amber",
                  },
                  {
                    key: "transit_forecasts",
                    label: "Transit Forecasts",
                    icon: TrendingUp,
                    color: "teal",
                  },
                  {
                    key: "premium_reports",
                    label: "Premium Reports",
                    icon: BookOpen,
                    color: "indigo",
                  },
                  {
                    key: "ai_interpretations",
                    label: "AI Interpretations",
                    icon: Sparkles,
                    color: "purple",
                  },
                  {
                    key: "chart_sharing",
                    label: "Chart Sharing",
                    icon: Users,
                    color: "green",
                  },
                  {
                    key: "priority_support",
                    label: "Priority Support",
                    icon: Zap,
                    color: "orange",
                  },
                  {
                    key: "advanced_aspects",
                    label: "Advanced Aspects",
                    icon: Star,
                    color: "yellow",
                  },
                  {
                    key: "yearly_forecasts",
                    label: "Yearly Forecasts",
                    icon: Calendar,
                    color: "red",
                  },
                ].map(({ key, label, icon: Icon, color }) => (
                  <div key={key} className="bg-dark-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className={`w-5 h-5 mr-3 text-${color}-400`} />
                        <span className="text-white font-medium">{label}</span>
                      </div>
                      <Switch
                        checked={
                          currentPlan.astrology_features[
                            key as keyof AstrologyFeatures
                          ] as boolean
                        }
                        onCheckedChange={(checked) =>
                          handleAstrologyFeatureChange(
                            key as keyof AstrologyFeatures,
                            checked,
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button onClick={cancelEdit} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={savePlan}
              loading={loading}
              icon={Save}
              className="bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              {isAddingPlan ? "Create Plan" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Plans List */}
      {plans.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg border border-dark-700">
          <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No subscription plans found.</p>
          <p className="text-gray-500 text-sm mb-6">
            Create your first astrology plan to get started with premium
            features.
          </p>
          <Button
            onClick={createDefaultPlans}
            icon={Sparkles}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            Create Default Plans
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-dark-800 rounded-xl overflow-hidden border transition-all duration-200 hover:shadow-lg ${
                plan.is_active
                  ? plan.is_popular
                    ? "border-purple-500 shadow-purple-500/20"
                    : "border-dark-600"
                  : "border-red-900/50 opacity-75"
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <h3 className="text-xl font-semibold text-white mr-2">
                      {plan.name}
                    </h3>
                    {plan.is_popular && (
                      <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEditPlan(plan)}
                      className="p-2 bg-dark-700 hover:bg-dark-600 rounded text-gray-300 hover:text-white transition-colors"
                      title="Edit plan"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="p-2 bg-dark-700 hover:bg-red-900 rounded text-gray-300 hover:text-white transition-colors"
                      title="Delete plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-400 ml-1">/{plan.interval}</span>
                  </div>
                  {!plan.is_active && (
                    <div className="inline-block px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded">
                      Inactive
                    </div>
                  )}
                </div>

                <p className="text-gray-300 mb-4 text-sm">{plan.description}</p>

                {/* Astrology Features Summary */}
                <div className="mb-4 p-3 bg-dark-700 rounded-lg">
                  <h4 className="text-white font-medium mb-2 text-sm flex items-center">
                    <Star className="w-4 h-4 mr-1 text-purple-400" />
                    Astrology Features
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <Moon className="w-3 h-3 mr-1 text-blue-400" />
                      <span className="text-gray-300">
                        Charts:{" "}
                        {plan.astrology_features.birth_charts_limit || "∞"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1 text-pink-400" />
                      <span className="text-gray-300">
                        Reports:{" "}
                        {plan.astrology_features.compatibility_reports_limit ||
                          "∞"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-amber-400" />
                      <span
                        className={`${plan.astrology_features.daily_horoscopes ? "text-green-400" : "text-gray-500"}`}
                      >
                        Horoscopes
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
                      <span
                        className={`${plan.astrology_features.ai_interpretations ? "text-green-400" : "text-gray-500"}`}
                      >
                        AI Analysis
                      </span>
                    </div>
                  </div>
                </div>

                {/* General Features */}
                <ul className="space-y-1 mb-6 text-sm">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-gray-400 text-xs">
                      +{plan.features.length - 4} more features
                    </li>
                  )}
                </ul>

                <Button
                  onClick={() => togglePlanStatus(plan)}
                  variant={plan.is_active ? "outline" : "primary"}
                  className={`w-full ${
                    plan.is_active
                      ? "border-red-500 text-red-400 hover:bg-red-900/20"
                      : "bg-gradient-to-r from-green-600 to-emerald-600"
                  }`}
                >
                  {plan.is_active ? "Deactivate Plan" : "Activate Plan"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanManagement;
