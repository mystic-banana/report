import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { createClient } from '@supabase/supabase-js';
import { getPopularTemplates, getTemplateAnalytics } from '../../../utils/templateAnalytics';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Users, EyeOff } from 'lucide-react';
import Button from '../../../components/ui/Button';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TemplateAnalytics = () => {
  const [reportTypes, setReportTypes] = useState<string[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [popularTemplates, setPopularTemplates] = useState<{
    id: string;
    name: string;
    usage_count: number;
  }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateAnalytics, setTemplateAnalytics] = useState<{
    totalUsageCount: number;
    usageByDay: { date: string; count: number }[];
  }>({
    totalUsageCount: 0,
    usageByDay: []
  });
  const [loading, setLoading] = useState(true);

  // Load available report types
  useEffect(() => {
    const loadReportTypes = async () => {
      const { data, error } = await supabase
        .from('report_templates')
        .select('report_type')
        .eq('is_active', true);

      if (data && !error) {
        // Extract unique report types
        const types = [...new Set(data.map(item => item.report_type))];
        setReportTypes(types);
        if (types.length > 0) {
          setSelectedReportType(types[0]);
        }
      }
    };

    loadReportTypes();
  }, []);

  // Load popular templates when report type changes
  useEffect(() => {
    const loadPopularTemplates = async () => {
      if (!selectedReportType) return;

      setLoading(true);
      const templates = await getPopularTemplates(selectedReportType, 10);
      setPopularTemplates(templates);
      
      // Auto-select the most popular template
      if (templates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(templates[0].id);
      }
      
      setLoading(false);
    };

    loadPopularTemplates();
  }, [selectedReportType]);

  // Load template analytics when selected template changes
  useEffect(() => {
    const loadTemplateAnalytics = async () => {
      if (!selectedTemplate) return;

      setLoading(true);
      const analytics = await getTemplateAnalytics(selectedTemplate);
      setTemplateAnalytics(analytics);
      setLoading(false);
    };

    loadTemplateAnalytics();
  }, [selectedTemplate]);

  // Format report type for display
  const formatReportType = (type: string): string => {
    if (!type) return "";
    
    return type
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  const handleExportCSV = () => {
    if (!templateAnalytics.usageByDay.length) return;
    
    // Create CSV content
    const headers = "Date,Usage Count\n";
    const rows = templateAnalytics.usageByDay.map(day => 
      `${day.date},${day.count}`
    ).join("\n");
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `template-usage-${selectedTemplate}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Template Analytics Dashboard</h1>

        {/* Report Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Report Type</label>
          <select
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md"
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
          >
            {reportTypes.map(type => (
              <option key={type} value={type}>
                {formatReportType(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 mr-2 text-amber-500" />
              <h3 className="text-sm font-medium">Last 30 Days</h3>
            </div>
            <p className="text-2xl font-bold">
              {templateAnalytics.usageByDay
                .reduce((sum, day) => sum + day.count, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total uses</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              <h3 className="text-sm font-medium">Most Popular</h3>
            </div>
            <p className="text-2xl font-bold">
              {popularTemplates.length > 0
                ? popularTemplates[0].name
                : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {popularTemplates.length > 0
                ? `${popularTemplates[0].usage_count} uses total`
                : 'No data'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              <h3 className="text-sm font-medium">Total Templates</h3>
            </div>
            <p className="text-2xl font-bold">
              {reportTypes.length > 0
                ? popularTemplates.length.toLocaleString()
                : '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">For {formatReportType(selectedReportType)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <EyeOff className="h-5 w-5 mr-2 text-purple-500" />
              <h3 className="text-sm font-medium">Unused Templates</h3>
            </div>
            <p className="text-2xl font-bold">
              {reportTypes.length > 0 && popularTemplates.length > 0
                ? popularTemplates.filter(t => t.usage_count === 0).length.toLocaleString()
                : '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Consider removing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Popular Templates Chart */}
          <div className="col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Popular Templates</h3>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : popularTemplates.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={popularTemplates.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="usage_count" fill="#f59e0b" name="Usage Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                No data available
              </div>
            )}
            
            <div className="mt-4">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedTemplate || ''}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">Select a template</option>
                {popularTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.usage_count} uses)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Usage Over Time Chart */}
          <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Usage Over Time</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportCSV}
                disabled={!templateAnalytics.usageByDay.length}
              >
                Export CSV
              </Button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : templateAnalytics.usageByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={templateAnalytics.usageByDay.slice(-30)} // Last 30 days
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getMonth()+1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#f59e0b" 
                    name="Daily Usage" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                No usage data available for the selected template
              </div>
            )}
            
            {templateAnalytics.totalUsageCount > 0 && (
              <div className="mt-3 text-sm text-gray-500">
                Total lifetime uses: {templateAnalytics.totalUsageCount.toLocaleString()}
              </div>
            )}
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Recommendations</h3>
          
          <ul className="space-y-3">
            {popularTemplates.length === 0 && (
              <li className="text-sm p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
                <span className="font-medium">Create Templates:</span> There are no templates available for {formatReportType(selectedReportType)}. Consider creating some templates.
              </li>
            )}
            
            {popularTemplates.filter(t => t.usage_count === 0).length > 0 && (
              <li className="text-sm p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded">
                <span className="font-medium">Unused Templates:</span> {popularTemplates.filter(t => t.usage_count === 0).length} templates for {formatReportType(selectedReportType)} have never been used. Consider removing or revising them.
              </li>
            )}
            
            {popularTemplates.length > 0 && popularTemplates[0].usage_count > 0 && (
              <li className="text-sm p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                <span className="font-medium">Popular Template:</span> "{popularTemplates[0].name}" is your most popular template for {formatReportType(selectedReportType)}. Consider creating variations of this template.
              </li>
            )}
            
            {templateAnalytics.usageByDay.length > 15 && (
              <li className="text-sm p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded">
                <span className="font-medium">Usage Trends:</span> Monitor the usage trends to identify patterns and optimize templates accordingly.
              </li>
            )}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TemplateAnalytics;
