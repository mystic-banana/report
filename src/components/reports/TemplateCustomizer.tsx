import React, { useState, useEffect } from "react";
import {
  ReportTemplate,
  TemplateTheme,
  TemplateSection,
} from "../../types/reportTypes";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import {
  X,
  Save,
  Eye,
  Plus,
  Trash2,
  Move,
  Palette,
  Type,
  Layout,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

interface TemplateCustomizerProps {
  template: ReportTemplate;
  onClose: () => void;
  onSave: (updatedTemplate: Partial<ReportTemplate>) => void;
}

const TemplateCustomizer: React.FC<TemplateCustomizerProps> = ({
  template,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<
    "theme" | "sections" | "layout" | "styles"
  >("theme");
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Template state
  const [templateName, setTemplateName] = useState(template.name);
  const [templateDescription, setTemplateDescription] = useState(
    template.description || "",
  );
  const [templateTheme, setTemplateTheme] = useState<TemplateTheme>(
    template.theme,
  );
  const [templateSections, setTemplateSections] = useState<TemplateSection[]>(
    template.sections,
  );
  const [templateLayout, setTemplateLayout] = useState(template.layout);
  const [templateTags, setTemplateTags] = useState<string[]>(template.tags);
  const [isPublic, setIsPublic] = useState(template.isPublic);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedTemplate: Partial<ReportTemplate> = {
        name: templateName,
        description: templateDescription,
        theme: templateTheme,
        sections: templateSections,
        layout: templateLayout,
        tags: templateTags,
        isPublic,
      };

      await onSave(updatedTemplate);
      toast.success("Template saved successfully");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = () => {
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      name: "New Section",
      type: "content",
      component: "div",
      props: {},
      order: templateSections.length,
      isRequired: false,
      isCustomizable: true,
    };
    setTemplateSections([...templateSections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setTemplateSections(templateSections.filter((s) => s.id !== sectionId));
  };

  const updateSection = (
    sectionId: string,
    updates: Partial<TemplateSection>,
  ) => {
    setTemplateSections(
      templateSections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s,
      ),
    );
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    const currentIndex = templateSections.findIndex((s) => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= templateSections.length) return;

    const newSections = [...templateSections];
    [newSections[currentIndex], newSections[newIndex]] = [
      newSections[newIndex],
      newSections[currentIndex],
    ];

    // Update order values
    newSections.forEach((section, index) => {
      section.order = index;
    });

    setTemplateSections(newSections);
  };

  const updateThemeColor = (
    colorKey: keyof TemplateTheme["colors"],
    value: string,
  ) => {
    setTemplateTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const updateThemeFont = (
    fontKey: keyof TemplateTheme["fonts"],
    value: string,
  ) => {
    setTemplateTheme((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontKey]: value,
      },
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !templateTags.includes(tag)) {
      setTemplateTags([...templateTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTemplateTags(templateTags.filter((t) => t !== tag));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-2xl max-w-6xl w-full h-[90vh] flex flex-col border border-dark-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Customize Template
            </h2>
            <p className="text-gray-400 mt-1">
              Modify the appearance and structure of your template
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Save"}
            </Button>
            <Button variant="ghost" size="sm" icon={X} onClick={onClose} />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-dark-900 border-r border-dark-700 overflow-y-auto">
            {/* Basic Info */}
            <div className="p-6 border-b border-dark-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Template Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 text-amber-600 bg-dark-700 border-dark-600 rounded focus:ring-amber-500"
                    />
                    <span>Make template public</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-dark-700">
              <nav className="flex">
                {[
                  { id: "theme", label: "Theme", icon: Palette },
                  { id: "sections", label: "Sections", icon: Layout },
                  { id: "layout", label: "Layout", icon: Settings },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === id
                        ? "text-amber-400 border-b-2 border-amber-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "theme" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-semibold text-white mb-3">
                      Colors
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(templateTheme.colors).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center space-x-3"
                          >
                            <label className="text-sm text-gray-300 w-20 capitalize">
                              {key}
                            </label>
                            <input
                              type="color"
                              value={value}
                              onChange={(e) =>
                                updateThemeColor(key as any, e.target.value)
                              }
                              className="w-12 h-8 rounded border border-dark-600"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                updateThemeColor(key as any, e.target.value)
                              }
                              className="flex-1 bg-dark-700 border border-dark-600 rounded py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-white mb-3">
                      Fonts
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(templateTheme.fonts).map(
                        ([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm text-gray-300 mb-1 capitalize">
                              {key} Font
                            </label>
                            <select
                              value={value}
                              onChange={(e) =>
                                updateThemeFont(key as any, e.target.value)
                              }
                              className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              <option value="Arial, sans-serif">Arial</option>
                              <option value="Georgia, serif">Georgia</option>
                              <option value="'Times New Roman', serif">
                                Times New Roman
                              </option>
                              <option value="'Helvetica Neue', sans-serif">
                                Helvetica
                              </option>
                              <option value="'Roboto', sans-serif">
                                Roboto
                              </option>
                              <option value="'Open Sans', sans-serif">
                                Open Sans
                              </option>
                            </select>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sections" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-white">
                      Template Sections
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={addSection}
                    >
                      Add Section
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {templateSections.map((section, index) => (
                      <div
                        key={section.id}
                        className="bg-dark-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) =>
                              updateSection(section.id, {
                                name: e.target.value,
                              })
                            }
                            className="bg-dark-600 border border-dark-500 rounded py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => moveSection(section.id, "up")}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              onClick={() => moveSection(section.id, "down")}
                              disabled={index === templateSections.length - 1}
                              className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                            >
                              <ChevronDown size={16} />
                            </button>
                            <button
                              onClick={() => removeSection(section.id)}
                              className="p-1 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Type
                            </label>
                            <select
                              value={section.type}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  type: e.target.value as any,
                                })
                              }
                              className="w-full bg-dark-600 border border-dark-500 rounded py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="header">Header</option>
                              <option value="content">Content</option>
                              <option value="chart">Chart</option>
                              <option value="table">Table</option>
                              <option value="footer">Footer</option>
                              <option value="custom">Custom</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Component
                            </label>
                            <input
                              type="text"
                              value={section.component}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  component: e.target.value,
                                })
                              }
                              className="w-full bg-dark-600 border border-dark-500 rounded py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-3">
                          <label className="flex items-center space-x-2 text-xs text-gray-400">
                            <input
                              type="checkbox"
                              checked={section.isRequired}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  isRequired: e.target.checked,
                                })
                              }
                              className="w-3 h-3 text-amber-600 bg-dark-600 border-dark-500 rounded focus:ring-amber-500"
                            />
                            <span>Required</span>
                          </label>
                          <label className="flex items-center space-x-2 text-xs text-gray-400">
                            <input
                              type="checkbox"
                              checked={section.isCustomizable}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  isCustomizable: e.target.checked,
                                })
                              }
                              className="w-3 h-3 text-amber-600 bg-dark-600 border-dark-500 rounded focus:ring-amber-500"
                            />
                            <span>Customizable</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "layout" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold text-white mb-3">
                      Layout Style
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "single-column", label: "Single Column" },
                        { value: "two-column", label: "Two Column" },
                        { value: "magazine", label: "Magazine" },
                        { value: "grid", label: "Grid" },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setTemplateLayout(value as any)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            templateLayout === value
                              ? "border-amber-500 bg-amber-500/10 text-amber-400"
                              : "border-dark-600 bg-dark-700 text-gray-300 hover:border-amber-500/50"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-white mb-3">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {templateTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-amber-600/20 text-amber-300 rounded-full text-xs"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-amber-100"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add tag..."
                        className="flex-1 bg-dark-700 border border-dark-600 rounded py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addTag((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.querySelector(
                            'input[placeholder="Add tag..."]',
                          ) as HTMLInputElement;
                          if (input?.value) {
                            addTag(input.value);
                            input.value = "";
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-white overflow-y-auto">
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{
                      color: templateTheme.colors.primary,
                      fontFamily: templateTheme.fonts.heading,
                    }}
                  >
                    {templateName}
                  </h1>
                  <p
                    className="text-gray-600"
                    style={{ fontFamily: templateTheme.fonts.body }}
                  >
                    Template Preview
                  </p>
                </div>

                <div className="space-y-6">
                  {templateSections.map((section) => (
                    <div
                      key={section.id}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6"
                      style={{
                        backgroundColor: templateTheme.colors.background,
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3
                          className="font-semibold"
                          style={{
                            color: templateTheme.colors.primary,
                            fontFamily: templateTheme.fonts.heading,
                          }}
                        >
                          {section.name}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                          {section.type}
                        </span>
                      </div>
                      <div
                        style={{
                          color: templateTheme.colors.text,
                          fontFamily: templateTheme.fonts.body,
                        }}
                      >
                        {section.type === "header" && (
                          <div>
                            <h2 className="text-2xl font-bold mb-2">
                              Sample Header
                            </h2>
                            <p className="text-gray-600">
                              This is a sample header section
                            </p>
                          </div>
                        )}
                        {section.type === "content" && (
                          <div>
                            <p>
                              This is a sample content section. Your
                              astrological analysis will appear here with
                              detailed interpretations and insights.
                            </p>
                          </div>
                        )}
                        {section.type === "chart" && (
                          <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
                            <span className="text-gray-500">
                              Chart Visualization
                            </span>
                          </div>
                        )}
                        {section.type === "table" && (
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2">
                                  Planet
                                </th>
                                <th className="border border-gray-300 p-2">
                                  Sign
                                </th>
                                <th className="border border-gray-300 p-2">
                                  Degree
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-gray-300 p-2">
                                  Sun
                                </td>
                                <td className="border border-gray-300 p-2">
                                  Leo
                                </td>
                                <td className="border border-gray-300 p-2">
                                  15°
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                        {section.type === "footer" && (
                          <div className="text-center text-gray-500">
                            <p>Generated by Mystic Banana Astrology</p>
                          </div>
                        )}
                        {section.type === "custom" && (
                          <div className="text-center text-gray-500">
                            <p>Custom section: {section.component}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomizer;
