import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Track template usage when a template is selected for PDF export
 */
export async function trackTemplateUsage(
  templateId: string, 
  userId: string, 
  reportType: string
): Promise<void> {
  try {
    await supabase
      .from('template_usage_stats')
      .insert({
        template_id: templateId,
        user_id: userId,
        report_type: reportType,
        used_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error tracking template usage:', error);
    // Don't throw - this is non-critical telemetry
  }
}

/**
 * Get popular templates based on usage stats
 */
export async function getPopularTemplates(
  reportType?: string,
  limit: number = 5
): Promise<{ id: string; name: string; usage_count: number }[]> {
  try {
    // Type for interface return value
    
    let query = supabase
      .from('template_usage_stats')
      .select(`
        template_id,
        report_templates!inner(id, name)
      `)
      .eq('report_templates.is_active', true);

    // Filter by report type if specified
    if (reportType) {
      query = query.eq('report_type', reportType);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Safely handle the Supabase response data structure
    const typedData = data as unknown as Array<{
      template_id: string;
      report_templates: {
        id: string;
        name: string;
      };
    }>;

    // Count usage per template
    const templateUsageCounts = typedData.reduce<Record<string, { id: string; name: string; usage_count: number }>>((acc, curr) => {
      const templateId = curr.template_id;
      const templateName = curr.report_templates?.name || 'Unknown Template';
      
      if (!acc[templateId]) {
        acc[templateId] = { 
          id: templateId, 
          name: templateName, 
          usage_count: 0 
        };
      }
      
      acc[templateId].usage_count += 1;
      return acc;
    }, {});

    // Convert to array, sort by usage count, and limit results
    return Object.values(templateUsageCounts)
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching popular templates:', error);
    return [];
  }
}

/**
 * Get user's template usage history
 */
export async function getUserTemplateHistory(userId: string): Promise<{
  template_id: string;
  template_name: string;
  report_type: string;
  used_at: string;
}[]> {
  try {
    // Type for interface return value
    
    const { data, error } = await supabase
      .from('template_usage_stats')
      .select(`
        template_id,
        report_templates!inner(name),
        report_type,
        used_at
      `)
      .eq('user_id', userId)
      .order('used_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    
    // Safely handle the Supabase response data structure
    const typedData = data as unknown as Array<{
      template_id: string;
      report_templates: {
        name: string;
      };
      report_type: string;
      used_at: string;
    }>;

    return typedData.map(item => ({
      template_id: item.template_id,
      template_name: item.report_templates?.name || 'Unknown Template',
      report_type: item.report_type,
      used_at: item.used_at
    }));
  } catch (error) {
    console.error('Error fetching user template history:', error);
    return [];
  }
}

/**
 * Get analytics data for template performance
 */
export async function getTemplateAnalytics(templateId: string) {
  try {
    const { data: usageData, error: usageError } = await supabase
      .from('template_usage_stats')
      .select('used_at')
      .eq('template_id', templateId);
      
    if (usageError) throw usageError;
    
    // Get total usage count
    const totalUsageCount = usageData.length;
    
    // Get usage data by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const usageByDay: Record<string, number> = {};
    
    // Initialize all days to zero
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      usageByDay[dateString] = 0;
    }
    
    // Fill in actual usage data
    usageData.forEach(item => {
      const dateString = item.used_at.split('T')[0];
      if (new Date(dateString) >= thirtyDaysAgo) {
        usageByDay[dateString] = (usageByDay[dateString] || 0) + 1;
      }
    });
    
    return {
      totalUsageCount,
      usageByDay: Object.entries(usageByDay)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, count]) => ({ date, count }))
    };
  } catch (error) {
    console.error('Error getting template analytics:', error);
    return {
      totalUsageCount: 0,
      usageByDay: []
    };
  }
}
