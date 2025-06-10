import { supabase } from "../lib/supabaseClient";
import type {
  ReportAnnotation,
  AnnotationCollection,
  AnnotationFilter,
  AnnotationPosition,
  AnnotationStyle,
} from "../types/reportTypes";

class AnnotationService {
  // Create a new annotation
  async createAnnotation(
    reportId: string,
    type: ReportAnnotation["type"],
    content: string,
    position: AnnotationPosition,
    style: Partial<AnnotationStyle> = {},
    options: {
      isPrivate?: boolean;
      tags?: string[];
      parentId?: string;
    } = {},
  ): Promise<ReportAnnotation | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const defaultStyle: AnnotationStyle = {
        color: "#fbbf24",
        backgroundColor: "rgba(251, 191, 36, 0.2)",
        borderColor: "#fbbf24",
        opacity: 0.8,
        fontSize: 14,
        fontWeight: "normal",
        textDecoration: "none",
        ...style,
      };

      const annotation: ReportAnnotation = {
        id: crypto.randomUUID(),
        reportId,
        userId: user.user.id,
        type,
        content,
        position,
        style: defaultStyle,
        isPrivate: options.isPrivate || false,
        tags: options.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: options.parentId,
        resolved: false,
      };

      // Store annotation in localStorage for now (could be moved to database)
      const existingAnnotations = this.getStoredAnnotations(reportId);
      existingAnnotations.push(annotation);
      this.saveAnnotations(reportId, existingAnnotations);

      return annotation;
    } catch (error) {
      console.error("Error creating annotation:", error);
      return null;
    }
  }

  // Get annotations for a report
  async getAnnotations(
    reportId: string,
    filter?: AnnotationFilter,
  ): Promise<ReportAnnotation[]> {
    try {
      let annotations = this.getStoredAnnotations(reportId);

      // Apply filters
      if (filter) {
        annotations = this.applyFilter(annotations, filter);
      }

      return annotations.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("Error getting annotations:", error);
      return [];
    }
  }

  // Update an annotation
  async updateAnnotation(
    annotationId: string,
    updates: Partial<ReportAnnotation>,
  ): Promise<ReportAnnotation | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Find the annotation across all reports
      const allStoredData = this.getAllStoredAnnotations();
      let targetReportId: string | null = null;
      let targetAnnotation: ReportAnnotation | null = null;

      for (const [reportId, annotations] of Object.entries(allStoredData)) {
        const annotation = annotations.find((a) => a.id === annotationId);
        if (annotation) {
          targetReportId = reportId;
          targetAnnotation = annotation;
          break;
        }
      }

      if (!targetReportId || !targetAnnotation) {
        throw new Error("Annotation not found");
      }

      // Check permissions
      if (targetAnnotation.userId !== user.user.id) {
        throw new Error("Not authorized to update this annotation");
      }

      // Update the annotation
      const updatedAnnotation = {
        ...targetAnnotation,
        ...updates,
        updatedAt: new Date(),
      };

      // Update in storage
      const annotations = this.getStoredAnnotations(targetReportId);
      const index = annotations.findIndex((a) => a.id === annotationId);
      if (index !== -1) {
        annotations[index] = updatedAnnotation;
        this.saveAnnotations(targetReportId, annotations);
      }

      return updatedAnnotation;
    } catch (error) {
      console.error("Error updating annotation:", error);
      return null;
    }
  }

  // Delete an annotation
  async deleteAnnotation(annotationId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Find and delete the annotation
      const allStoredData = this.getAllStoredAnnotations();

      for (const [reportId, annotations] of Object.entries(allStoredData)) {
        const annotationIndex = annotations.findIndex(
          (a) => a.id === annotationId,
        );
        if (annotationIndex !== -1) {
          const annotation = annotations[annotationIndex];

          // Check permissions
          if (annotation.userId !== user.user.id) {
            throw new Error("Not authorized to delete this annotation");
          }

          // Remove the annotation
          annotations.splice(annotationIndex, 1);
          this.saveAnnotations(reportId, annotations);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting annotation:", error);
      return false;
    }
  }

  // Get annotation by ID
  async getAnnotation(annotationId: string): Promise<ReportAnnotation | null> {
    try {
      const allStoredData = this.getAllStoredAnnotations();

      for (const annotations of Object.values(allStoredData)) {
        const annotation = annotations.find((a) => a.id === annotationId);
        if (annotation) {
          return annotation;
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting annotation:", error);
      return null;
    }
  }

  // Create annotation collection
  async createCollection(
    name: string,
    description?: string,
    annotationIds: string[] = [],
  ): Promise<AnnotationCollection | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get the annotations
      const annotations: ReportAnnotation[] = [];
      for (const id of annotationIds) {
        const annotation = await this.getAnnotation(id);
        if (annotation) {
          annotations.push(annotation);
        }
      }

      const collection: AnnotationCollection = {
        id: crypto.randomUUID(),
        name,
        description,
        annotations,
        userId: user.user.id,
        isShared: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store collection
      const collections = this.getStoredCollections();
      collections.push(collection);
      localStorage.setItem(
        "annotation_collections",
        JSON.stringify(collections),
      );

      return collection;
    } catch (error) {
      console.error("Error creating collection:", error);
      return null;
    }
  }

  // Get user's annotation collections
  async getCollections(): Promise<AnnotationCollection[]> {
    try {
      return this.getStoredCollections();
    } catch (error) {
      console.error("Error getting collections:", error);
      return [];
    }
  }

  // Search annotations
  async searchAnnotations(
    query: string,
    reportId?: string,
  ): Promise<ReportAnnotation[]> {
    try {
      const searchTerm = query.toLowerCase().trim();
      if (!searchTerm) return [];

      let allAnnotations: ReportAnnotation[] = [];

      if (reportId) {
        allAnnotations = this.getStoredAnnotations(reportId);
      } else {
        // Search across all reports
        const allStoredData = this.getAllStoredAnnotations();
        allAnnotations = Object.values(allStoredData).flat();
      }

      return allAnnotations.filter(
        (annotation) =>
          annotation.content.toLowerCase().includes(searchTerm) ||
          annotation.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm),
          ) ||
          (annotation.position.textRange?.text || "")
            .toLowerCase()
            .includes(searchTerm),
      );
    } catch (error) {
      console.error("Error searching annotations:", error);
      return [];
    }
  }

  // Export annotations
  async exportAnnotations(
    reportId: string,
    format: "json" | "csv" | "html",
  ): Promise<Blob | null> {
    try {
      const annotations = this.getStoredAnnotations(reportId);

      switch (format) {
        case "json":
          return new Blob([JSON.stringify(annotations, null, 2)], {
            type: "application/json",
          });

        case "csv":
          const csvContent = this.generateCSV(annotations);
          return new Blob([csvContent], { type: "text/csv" });

        case "html":
          const htmlContent = this.generateHTML(annotations);
          return new Blob([htmlContent], { type: "text/html" });

        default:
          return null;
      }
    } catch (error) {
      console.error("Error exporting annotations:", error);
      return null;
    }
  }

  // Helper methods
  private getStoredAnnotations(reportId: string): ReportAnnotation[] {
    try {
      const key = `annotations_${reportId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveAnnotations(
    reportId: string,
    annotations: ReportAnnotation[],
  ): void {
    const key = `annotations_${reportId}`;
    localStorage.setItem(key, JSON.stringify(annotations));
  }

  private getAllStoredAnnotations(): Record<string, ReportAnnotation[]> {
    const result: Record<string, ReportAnnotation[]> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("annotations_")) {
        const reportId = key.replace("annotations_", "");
        result[reportId] = this.getStoredAnnotations(reportId);
      }
    }

    return result;
  }

  private getStoredCollections(): AnnotationCollection[] {
    try {
      const stored = localStorage.getItem("annotation_collections");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private applyFilter(
    annotations: ReportAnnotation[],
    filter: AnnotationFilter,
  ): ReportAnnotation[] {
    return annotations.filter((annotation) => {
      // Filter by type
      if (filter.type && !filter.type.includes(annotation.type)) {
        return false;
      }

      // Filter by tags
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some((tag) =>
          annotation.tags.includes(tag),
        );
        if (!hasMatchingTag) return false;
      }

      // Filter by date range
      if (filter.dateRange) {
        const createdAt = new Date(annotation.createdAt);
        if (
          createdAt < filter.dateRange.start ||
          createdAt > filter.dateRange.end
        ) {
          return false;
        }
      }

      // Filter by author
      if (filter.author && annotation.userId !== filter.author) {
        return false;
      }

      // Filter by resolved status
      if (
        filter.resolved !== undefined &&
        annotation.resolved !== filter.resolved
      ) {
        return false;
      }

      // Filter by search term
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        const matchesContent = annotation.content
          .toLowerCase()
          .includes(searchTerm);
        const matchesTags = annotation.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm),
        );
        const matchesText = (annotation.position.textRange?.text || "")
          .toLowerCase()
          .includes(searchTerm);

        if (!matchesContent && !matchesTags && !matchesText) {
          return false;
        }
      }

      return true;
    });
  }

  private generateCSV(annotations: ReportAnnotation[]): string {
    const headers = [
      "ID",
      "Type",
      "Content",
      "Tags",
      "Created",
      "Updated",
      "Resolved",
    ];

    const rows = annotations.map((annotation) => [
      annotation.id,
      annotation.type,
      `"${annotation.content.replace(/"/g, '""')}"`, // Escape quotes
      annotation.tags.join(";"),
      annotation.createdAt.toISOString(),
      annotation.updatedAt.toISOString(),
      annotation.resolved ? "Yes" : "No",
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  private generateHTML(annotations: ReportAnnotation[]): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Report Annotations Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .annotation { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .annotation-header { font-weight: bold; margin-bottom: 10px; }
        .annotation-content { margin: 10px 0; }
        .annotation-meta { font-size: 12px; color: #666; }
        .highlight { background: #fff3cd; }
        .note { background: #d1ecf1; }
        .bookmark { background: #d4edda; }
        .comment { background: #f8d7da; }
    </style>
</head>
<body>
    <h1>Report Annotations</h1>
    <p>Exported on ${new Date().toLocaleString()}</p>
    
    ${annotations
      .map(
        (annotation) => `
        <div class="annotation ${annotation.type}">
            <div class="annotation-header">
                ${annotation.type.toUpperCase()}: ${annotation.id}
            </div>
            <div class="annotation-content">
                ${annotation.content}
            </div>
            ${
              annotation.tags.length > 0
                ? `
                <div class="annotation-meta">
                    Tags: ${annotation.tags.join(", ")}
                </div>
            `
                : ""
            }
            <div class="annotation-meta">
                Created: ${new Date(annotation.createdAt).toLocaleString()}
                ${annotation.resolved ? " | Status: Resolved" : ""}
            </div>
        </div>
    `,
      )
      .join("")}
</body>
</html>`;
  }

  // Utility methods for text selection and highlighting
  getTextSelection(): Selection | null {
    return window.getSelection();
  }

  createHighlight(
    selection: Selection,
    style: AnnotationStyle,
  ): AnnotationPosition | null {
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    if (!selectedText.trim()) return null;

    // Create a unique selector for the selected text
    const selector = this.generateSelector(range);

    return {
      selector,
      textRange: {
        start: range.startOffset,
        end: range.endOffset,
        text: selectedText,
      },
    };
  }

  private generateSelector(range: Range): string {
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    // Generate a CSS selector path to the element
    const getPath = (element: Node): string => {
      if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentNode!;
      }

      const path = [];
      while (element && element.nodeType === Node.ELEMENT_NODE) {
        const el = element as Element;
        let selector = el.tagName.toLowerCase();

        if (el.id) {
          selector += `#${el.id}`;
        } else if (el.className) {
          selector += `.${el.className.split(" ").join(".")}`;
        }

        path.unshift(selector);
        element = element.parentNode;

        if (el.id) break; // Stop at elements with IDs
      }

      return path.join(" > ");
    };

    return getPath(startContainer);
  }
}

export const annotationService = new AnnotationService();
