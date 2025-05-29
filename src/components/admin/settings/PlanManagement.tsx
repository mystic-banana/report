import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Plus, Edit2, Trash2, Save, X, AlertTriangle, DollarSign } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const defaultPlan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  description: '',
  price: 0,
  currency: 'USD',
  interval: 'monthly',
  features: [],
  is_active: true
};

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>>(defaultPlan);
  const [newFeature, setNewFeature] = useState('');
  
  useEffect(() => {
    fetchPlans();
  }, []);
  
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');
      
      if (error) throw error;
      
      setPlans(data || []);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError('Failed to load subscription plans');
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setCurrentPlan({
      ...currentPlan,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) 
          : value
    });
  };
  
  const addFeature = () => {
    if (!newFeature.trim()) return;
    
    setCurrentPlan({
      ...currentPlan,
      features: [...currentPlan.features, newFeature.trim()]
    });
    
    setNewFeature('');
  };
  
  const removeFeature = (index: number) => {
    setCurrentPlan({
      ...currentPlan,
      features: currentPlan.features.filter((_, i) => i !== index)
    });
  };
  
  const savePlan = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      // Validate plan data
      if (!currentPlan.name.trim()) {
        setError('Plan name is required');
        return;
      }
      
      if (currentPlan.price < 0) {
        setError('Price cannot be negative');
        return;
      }
      
      const timestamp = new Date().toISOString();
      
      if (isAddingPlan) {
        // Add new plan
        const { data, error } = await supabase
          .from('subscription_plans')
          .insert({
            ...currentPlan,
            created_at: timestamp,
            updated_at: timestamp
          })
          .select();
        
        if (error) throw error;
        
        setPlans([...plans, data[0]]);
        setSuccess('Plan added successfully');
      } else if (editingPlan) {
        // Update existing plan
        const { data, error } = await supabase
          .from('subscription_plans')
          .update({
            ...currentPlan,
            updated_at: timestamp
          })
          .eq('id', editingPlan)
          .select();
        
        if (error) throw error;
        
        setPlans(plans.map(plan => plan.id === editingPlan ? data[0] : plan));
        setSuccess('Plan updated successfully');
      }
      
      // Reset form
      cancelEdit();
    } catch (err: any) {
      console.error('Error saving plan:', err);
      setError(err.message || 'Failed to save plan');
    }
  };
  
  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      
      // First check if any users are subscribed to this plan
      const { data: subscribers, error: checkError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('plan_id', planId)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (subscribers && subscribers.length > 0) {
        setError('Cannot delete this plan because users are currently subscribed to it. Deactivate it instead.');
        return;
      }
      
      // Delete the plan
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
      
      setPlans(plans.filter(plan => plan.id !== planId));
      setSuccess('Plan deleted successfully');
    } catch (err: any) {
      console.error('Error deleting plan:', err);
      setError(err.message || 'Failed to delete plan');
    }
  };
  
  const togglePlanStatus = async (plan: SubscriptionPlan) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          is_active: !plan.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);
      
      if (error) throw error;
      
      setPlans(plans.map(p => 
        p.id === plan.id 
          ? { ...p, is_active: !p.is_active } 
          : p
      ));
      
      setSuccess(`Plan ${plan.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (err: any) {
      console.error('Error toggling plan status:', err);
      setError(err.message || 'Failed to update plan status');
    }
  };
  
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
        <h2 className="text-2xl font-semibold text-white">Subscription Plans</h2>
        <button
          onClick={startAddPlan}
          className="flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add New Plan
        </button>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-900/30 border border-red-800 rounded-md flex items-start">
          <AlertTriangle size={20} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
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
        <div className="bg-dark-700 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium text-white">
              {isAddingPlan ? 'Add New Plan' : 'Edit Plan'}
            </h3>
            <button
              onClick={cancelEdit}
              className="p-1 bg-dark-600 hover:bg-dark-500 rounded text-gray-300 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentPlan.name}
                  onChange={handleInputChange}
                  placeholder="Premium Plan"
                  className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={currentPlan.description}
                  onChange={handleInputChange}
                  placeholder="Access to all premium content..."
                  rows={3}
                  className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                    Price
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
                      className="w-full p-2 pl-10 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={currentPlan.currency}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="AUD">AUD</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="interval" className="block text-sm font-medium text-gray-300 mb-1">
                  Billing Interval
                </label>
                <select
                  id="interval"
                  name="interval"
                  value={currentPlan.interval}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={currentPlan.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 bg-dark-800 border border-dark-600 rounded text-accent-600 focus:ring-accent-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-white font-medium">
                    Active
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Inactive plans won't be shown to users
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Plan Features
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  className="flex-1 p-2 bg-dark-800 border border-dark-600 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <button
                  onClick={addFeature}
                  className="px-3 py-2 bg-accent-600 hover:bg-accent-700 rounded-r-md text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="bg-dark-800 rounded-md p-2 min-h-[200px]">
                {currentPlan.features.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No features added yet</p>
                ) : (
                  <ul className="space-y-2">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center justify-between p-2 bg-dark-700 rounded-md">
                        <span className="text-white">{feature}</span>
                        <button
                          onClick={() => removeFeature(index)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-dark-600 hover:bg-dark-500 rounded-md text-white font-medium transition-colors mr-2"
            >
              Cancel
            </button>
            <button
              onClick={savePlan}
              className="px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors"
            >
              <Save size={16} className="inline mr-1" />
              {isAddingPlan ? 'Add Plan' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
      
      {/* Plans List */}
      {plans.length === 0 ? (
        <div className="text-center py-12 bg-dark-700 rounded-lg">
          <p className="text-gray-400">No subscription plans found. Create your first plan using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              className={`bg-dark-700 rounded-lg overflow-hidden border ${plan.is_active ? 'border-dark-600' : 'border-red-900/50'}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEditPlan(plan)}
                      className="p-1.5 bg-dark-600 hover:bg-dark-500 rounded text-gray-300 hover:text-white transition-colors"
                      title="Edit plan"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="p-1.5 bg-dark-600 hover:bg-red-900 rounded text-gray-300 hover:text-white transition-colors"
                      title="Delete plan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-white">{plan.currency === 'USD' ? '$' : ''}{plan.price}</span>
                    <span className="text-gray-400 ml-1">/{plan.interval}</span>
                  </div>
                  {!plan.is_active && (
                    <div className="mt-1 inline-block px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded">
                      Inactive
                    </div>
                  )}
                </div>
                
                <p className="text-gray-300 mb-4">{plan.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-accent-500 mr-2">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => togglePlanStatus(plan)}
                  className={`w-full py-2 rounded-md font-medium transition-colors ${
                    plan.is_active 
                      ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' 
                      : 'bg-green-900/30 hover:bg-green-900/50 text-green-400'
                  }`}
                >
                  {plan.is_active ? 'Deactivate Plan' : 'Activate Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanManagement;
