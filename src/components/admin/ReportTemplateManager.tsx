import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Copy, Eye, FileCode } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Define template schema
const templateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  report_type: z.string().min(1, 'Report type is required'),
  template_content: z.string().min(50, 'Template content must be at least 50 characters'),
  is_default: z.boolean().default(false),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

// Report type options
const reportTypes = [
  { value: 'western', label: 'Western Astrology' },
  { value: 'vedic', label: 'Vedic Astrology' },
  { value: 'chinese', label: 'Chinese Astrology' },
  { value: 'hellenistic', label: 'Hellenistic Astrology' },
  { value: 'compatibility', label: 'Compatibility Report' },
  { value: 'transit', label: 'Transit Report' },
];

export default function ReportTemplateManager() {
  const supabase = useSupabaseClient();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      report_type: '',
      template_content: '',
      is_default: false,
    },
  });

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Reset form when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setEditingTemplate(null);
      form.reset({
        name: '',
        description: '',
        report_type: '',
        template_content: '',
        is_default: false,
      });
    }
  }, [dialogOpen, form]);

  // Set form values when editing a template
  useEffect(() => {
    if (editingTemplate) {
      form.reset({
        name: editingTemplate.name,
        description: editingTemplate.description || '',
        report_type: editingTemplate.report_type,
        template_content: editingTemplate.template_content,
        is_default: editingTemplate.is_default || false,
      });
    }
  }, [editingTemplate, form]);

  // Fetch all templates from the database
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Save or update a template
  const onSubmit = async (values: TemplateFormValues) => {
    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('report_templates')
          .update(values)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        // Create new template
        const { error } = await supabase
          .from('report_templates')
          .insert(values);

        if (error) throw error;
        toast.success('Template created successfully');
      }

      // Close dialog and refresh templates
      setDialogOpen(false);
      fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(`Failed to save template: ${error.message}`);
    }
  };

  // Delete a template
  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(`Failed to delete template: ${error.message}`);
    }
  };

  // Duplicate a template
  const duplicateTemplate = async (template: any) => {
    try {
      const { name, description, report_type, template_content } = template;
      const newTemplate = {
        name: `${name} (Copy)`,
        description,
        report_type,
        template_content,
        is_default: false,
      };

      const { error } = await supabase
        .from('report_templates')
        .insert(newTemplate);

      if (error) throw error;
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      toast.error(`Failed to duplicate template: ${error.message}`);
    }
  };

  // Preview a template
  const previewTemplate = (template: any) => {
    setPreviewHtml(template.template_content);
    setPreviewOpen(true);
  };

  // Set a template as default for its type
  const setAsDefault = async (id: string, reportType: string) => {
    try {
      // First, unset default for this report type
      await supabase
        .from('report_templates')
        .update({ is_default: false })
        .eq('report_type', reportType)
        .eq('is_default', true);
      
      // Then set this template as default
      const { error } = await supabase
        .from('report_templates')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Template set as default');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error setting template as default:', error);
      toast.error(`Failed to set as default: ${error.message}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Report Templates</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter template name" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for the template
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Report Type field */}
                  <FormField
                    control={form.control}
                    name="report_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {reportTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of report this template will be used for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description field */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a description for this template"
                            className="resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Template Content field */}
                  <FormField
                    control={form.control}
                    name="template_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template HTML</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter HTML template content with placeholders"
                            className="resize-y h-64 font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          HTML template with placeholders like {{REPORT_TITLE}}, {{PERSON_NAME}}, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Default Template checkbox */}
                  <FormField
                    control={form.control}
                    name="is_default"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Use as default template for this report type
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No templates found. Create your first template!
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        {reportTypes.find((t) => t.value === template.report_type)?.label ||
                          template.report_type}
                      </TableCell>
                      <TableCell>
                        {template.is_default ? (
                          <span className="text-green-600 font-medium">Default</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAsDefault(template.id, template.report_type)}
                          >
                            Set as default
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {template.updated_at
                          ? format(new Date(template.updated_at), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{template.version || 1}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => previewTemplate(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTemplate(template);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateTemplate(template)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* HTML Template Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <FileCode className="h-5 w-5 mr-2" /> 
                    Template Preview
                  </DialogTitle>
                </DialogHeader>
                <div className="border rounded-md p-4 bg-gray-50">
                  <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                    {previewHtml}
                  </pre>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}
