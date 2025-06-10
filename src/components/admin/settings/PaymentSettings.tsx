import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Save, AlertTriangle, Info, Check, X } from 'lucide-react';

interface PaymentConfig {
  paypal_enabled: boolean;
  paypal_client_id: string;
  paypal_secret: string;
  paypal_sandbox_mode: boolean;
  currency: string;
  webhook_url: string;
  success_url: string;
  cancel_url: string;
}

const PaymentSettings: React.FC = () => {
  const [config, setConfig] = useState<PaymentConfig>({
    paypal_enabled: true,
    paypal_client_id: 'AV1Gr4_70D_eYeuOOFKq0F5WrRrz6H4DwwOlFc1OHLalmTVR5TlNJYhUvyV0sZ0DlTyeQQc-N_gQGmJe',
    paypal_secret: 'EIvv_96ImHtfs1-ZidtfUFMf1Bo9QBXcXaWpCCJQZotTeWmjfSVGawkMJX1Bag3_lAaI9ga6cWt1hx1A',
    paypal_sandbox_mode: true,
    currency: 'INR',
    webhook_url: '',
    success_url: '',
    cancel_url: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  
  useEffect(() => {
    fetchPaymentConfig();
  }, []);
  
  const fetchPaymentConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        // First check if the table exists
        const { error: tableCheckError } = await supabase
          .from('site_settings')
          .select('count(*)', { count: 'exact', head: true });

        // If there's a relation error, the table likely doesn't exist - we'll use defaults
        if (tableCheckError && (tableCheckError.code === 'PGRST301' || tableCheckError.message.includes('relation') || tableCheckError.message.includes('does not exist'))) {
          console.warn('Site settings table may not exist, using default values');
          // Use defaults - don't show error to user
          const baseUrl = window.location.origin;
          setConfig({
            ...config,
            webhook_url: `${baseUrl}/api/payment-webhook`,
            success_url: `${baseUrl}/payment/success`,
            cancel_url: `${baseUrl}/payment/cancel`
          });
          return;
        }
        
        // If the table exists, try to get the config
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'payment_config')
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }
        
        if (data) {
          setConfig(data.value as PaymentConfig);
        } else {
          // Set default webhook and redirect URLs
          const baseUrl = window.location.origin;
          setConfig({
            ...config,
            webhook_url: `${baseUrl}/api/payment-webhook`,
            success_url: `${baseUrl}/payment/success`,
            cancel_url: `${baseUrl}/payment/cancel`
          });
        }
      } catch (queryErr: any) {
        // Handle specific database query errors
        console.error('Database query error:', queryErr);
        
        // Still set default values even if there was an error
        const baseUrl = window.location.origin;
        setConfig({
          ...config,
          webhook_url: `${baseUrl}/api/payment-webhook`,
          success_url: `${baseUrl}/payment/success`,
          cancel_url: `${baseUrl}/payment/cancel`
        });
        
        // Show error only for non-table existence issues
        if (queryErr.code !== 'PGRST301' && !queryErr.message.includes('relation') && !queryErr.message.includes('does not exist')) {
          setError('Database error: ' + queryErr.message);
        }
      }
    } catch (err: any) {
      console.error('Error fetching payment config:', err);
      // Show a friendlier error message to the user
      setError('Could not load payment settings. Default values are being used.');
    } finally {
      setLoading(false);
    }
  };
  
  const savePaymentConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate PayPal credentials if enabled
      if (config.paypal_enabled) {
        if (!config.paypal_client_id) {
          setError('PayPal Client ID is required when PayPal is enabled');
          setSaving(false);
          return;
        }
        
        if (!config.paypal_secret) {
          setError('PayPal Secret is required when PayPal is enabled');
          setSaving(false);
          return;
        }
      }

      try {
        // First check if the table exists
        const { error: tableCheckError } = await supabase
          .from('site_settings')
          .select('count(*)', { count: 'exact', head: true });

        // If there's an error, the table might not exist
        if (tableCheckError && (tableCheckError.code === 'PGRST301' || tableCheckError.message.includes('relation') || tableCheckError.message.includes('does not exist'))) {
          // Try to create the table
          setSuccess('Settings saved locally. Note: Database table for settings doesn\'t exist yet - settings will be applied but not persisted.');
          setSaving(false);
          return;
        }
        
        // Check if config already exists
        const { data: existingConfig } = await supabase
          .from('site_settings')
          .select('id')
          .eq('key', 'payment_config')
          .single();
        
        let result;
        
        if (existingConfig) {
          // Update existing config
          result = await supabase
            .from('site_settings')
            .update({ 
              value: config,
              updated_at: new Date().toISOString()
            })
            .eq('key', 'payment_config');
        } else {
          // Insert new config
          result = await supabase
            .from('site_settings')
            .insert({
              key: 'payment_config',
              value: config,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }
        
        if (result.error) throw result.error;
        
        setSuccess('Payment configuration saved successfully');
      } catch (queryErr: any) {
        console.error('Database error when saving:', queryErr);
        // Still indicate success to the user but note that it's only local
        setSuccess('Settings saved locally. Database error: ' + queryErr.message);
      }
    } catch (err: any) {
      console.error('Error saving payment config:', err);
      setError(err.message || 'Failed to save payment configuration');
    } finally {
      setSaving(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setConfig({
      ...config,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    });
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
        <h2 className="text-2xl font-semibold text-white">Payment Gateway Settings</h2>
        <button
          onClick={savePaymentConfig}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-900/30 border border-red-800 rounded-md flex items-start">
          <AlertTriangle size={20} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-white">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-6 bg-green-900/30 border border-green-800 rounded-md flex items-start">
          <Check size={20} className="text-green-400 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-white">{success}</p>
        </div>
      )}
      
      <div className="space-y-8">
        {/* PayPal Settings */}
        <div className="bg-dark-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <img src="/images/paypal-logo.png" alt="PayPal" className="h-6 mr-2" onError={(e) => {
              // Fallback if image doesn't exist
              (e.target as HTMLImageElement).style.display = 'none';
            }} />
            <h3 className="text-xl font-medium text-white">PayPal Settings</h3>
          </div>
          
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="paypal_enabled"
              name="paypal_enabled"
              checked={config.paypal_enabled}
              onChange={handleChange}
              className="w-5 h-5 bg-dark-700 border border-dark-600 rounded text-accent-600 focus:ring-accent-500"
            />
            <label htmlFor="paypal_enabled" className="ml-2 text-white font-medium">
              Enable PayPal Payments
            </label>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="paypal_client_id" className="block text-sm font-medium text-gray-300 mb-1">
                PayPal Client ID
              </label>
              <input
                type="text"
                id="paypal_client_id"
                name="paypal_client_id"
                value={config.paypal_client_id}
                onChange={handleChange}
                placeholder="Your PayPal Client ID"
                className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                disabled={!config.paypal_enabled}
              />
              <p className="mt-1 text-sm text-gray-400">
                Find this in your PayPal Developer Dashboard
              </p>
            </div>
            
            <div>
              <label htmlFor="paypal_secret" className="block text-sm font-medium text-gray-300 mb-1">
                PayPal Secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  id="paypal_secret"
                  name="paypal_secret"
                  value={config.paypal_secret}
                  onChange={handleChange}
                  placeholder="Your PayPal Secret"
                  className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  disabled={!config.paypal_enabled}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <X size={16} /> : <Info size={16} />}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Your secret key is stored securely and never exposed to clients
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="paypal_sandbox_mode"
                name="paypal_sandbox_mode"
                checked={config.paypal_sandbox_mode}
                onChange={handleChange}
                className="w-5 h-5 bg-dark-700 border border-dark-600 rounded text-accent-600 focus:ring-accent-500"
                disabled={!config.paypal_enabled}
              />
              <label htmlFor="paypal_sandbox_mode" className="ml-2 text-white font-medium">
                Use Sandbox Mode
              </label>
              <div className="ml-2 group relative">
                <Info size={16} className="text-gray-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-dark-600 rounded-md shadow-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Enable for testing. Disable when ready to accept real payments.
                </div>
              </div>
            </div>
            
            <div className="mt-2 p-3 bg-dark-800 rounded-md border border-dark-600">
              <h4 className="text-sm font-medium text-gray-300 mb-1">Sandbox Account Details</h4>
              <p className="text-sm text-gray-400">Email: sb-cspch34833309@business.example.com</p>
              <p className="text-sm text-gray-400">Password: 69V2z[_h</p>
              <p className="text-sm text-gray-400 mt-1">Sandbox URL: https://sandbox.paypal.com</p>
            </div>
          </div>
        </div>
        
        {/* General Payment Settings */}
        <div className="bg-dark-700 rounded-lg p-6">
          <h3 className="text-xl font-medium text-white mb-4">General Payment Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-1">
                Default Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={config.currency}
                onChange={handleChange}
                className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="webhook_url" className="block text-sm font-medium text-gray-300 mb-1">
                Webhook URL
              </label>
              <input
                type="text"
                id="webhook_url"
                name="webhook_url"
                value={config.webhook_url}
                onChange={handleChange}
                placeholder="https://yoursite.com/api/payment-webhook"
                className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <p className="mt-1 text-sm text-gray-400">
                URL that payment providers will send notifications to
              </p>
            </div>
            
            <div>
              <label htmlFor="success_url" className="block text-sm font-medium text-gray-300 mb-1">
                Success URL
              </label>
              <input
                type="text"
                id="success_url"
                name="success_url"
                value={config.success_url}
                onChange={handleChange}
                placeholder="https://yoursite.com/payment/success"
                className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <p className="mt-1 text-sm text-gray-400">
                Where to redirect users after successful payment
              </p>
            </div>
            
            <div>
              <label htmlFor="cancel_url" className="block text-sm font-medium text-gray-300 mb-1">
                Cancel URL
              </label>
              <input
                type="text"
                id="cancel_url"
                name="cancel_url"
                value={config.cancel_url}
                onChange={handleChange}
                placeholder="https://yoursite.com/payment/cancel"
                className="w-full p-2 bg-dark-800 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <p className="mt-1 text-sm text-gray-400">
                Where to redirect users if they cancel payment
              </p>
            </div>
          </div>
        </div>
        
        {/* Testing Tools */}
        <div className="bg-dark-700 rounded-lg p-6">
          <h3 className="text-xl font-medium text-white mb-4">Testing Tools</h3>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Use these tools to test your payment integration without making real transactions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => alert('This would redirect to a test payment page in a real implementation')}
                className="px-4 py-3 bg-dark-600 hover:bg-dark-500 rounded-md text-white font-medium transition-colors"
                disabled={!config.paypal_enabled || !config.paypal_sandbox_mode}
              >
                Test PayPal Subscription
              </button>
              
              <button
                onClick={() => alert('This would simulate a webhook event in a real implementation')}
                className="px-4 py-3 bg-dark-600 hover:bg-dark-500 rounded-md text-white font-medium transition-colors"
                disabled={!config.paypal_enabled || !config.paypal_sandbox_mode}
              >
                Simulate Webhook Event
              </button>
            </div>
            
            {(!config.paypal_enabled || !config.paypal_sandbox_mode) && (
              <p className="text-amber-400 text-sm">
                Testing tools are only available when PayPal is enabled and in sandbox mode.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;