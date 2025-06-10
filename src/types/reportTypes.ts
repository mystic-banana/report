// Type definitions for the report generation service

export interface BirthData {
  date: string;
  time: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  name?: string;
}

export type ReportType =
  | "western"
  | "vedic"
  | "chinese"
  | "hellenistic"
  | "transit"
  | "compatibility";

export interface ReportConfig {
  language?: string;
  includeCharts?: boolean;
  includePDF?: boolean;
  detailLevel?: "basic" | "detailed" | "comprehensive";
  sections?: string[];
  customizations?: Record<string, any>;
  saveToDatabase?: boolean;
  useServerGeneration?: boolean;
  forceRegenerate?: boolean;
  theme?: "light" | "dark" | "mystical";
  format?: "html" | "pdf" | "both";
}

export interface ReportProgress {
  stage:
    | "validation"
    | "calculations"
    | "analysis"
    | "formatting"
    | "finalizing"
    | "complete"
    | "error"
    | "pending";
  progress: number; // 0-100
  message?: string;
  error?: string;
}

export interface GeneratedReport {
  id: string;
  type: ReportType;
  birthData: any; // Can be BirthData or compatibility data
  content: any;
  calculations: any;
  metadata: {
    generatedAt: Date;
    version: string;
    config: ReportConfig;
    wordCount?: number;
    sections?: number;
  };
  formats: {
    html: string;
    pdf?: string;
  };
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: "text" | "chart" | "table" | "list";
  data?: any;
}

export interface ChartData {
  type: "natal" | "transit" | "compatibility" | "progression";
  planets: PlanetPosition[];
  houses: HousePosition[];
  aspects: AspectData[];
  metadata: {
    calculationDate: Date;
    location: BirthData["location"];
    system: string;
  };
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
  dignity: "exalted" | "detriment" | "fall" | "domicile" | "neutral";
}

export interface HousePosition {
  house: number;
  sign: string;
  degree: number;
  ruler: string;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  applying: boolean;
  exact: boolean;
}

export interface TransitData {
  date: Date;
  planet: string;
  aspect: string;
  natalPlanet: string;
  orb: number;
  interpretation: string;
  significance: "major" | "minor" | "subtle";
}

export interface CompatibilityData {
  person1: BirthData;
  person2: BirthData;
  overallScore: number;
  categories: {
    emotional: number;
    intellectual: number;
    physical: number;
    spiritual: number;
  };
  aspects: AspectData[];
  composite: ChartData;
  synastry: ChartData;
}

export interface VedicData {
  rasi: ChartData;
  navamsa: ChartData;
  dashas: DashaData[];
  nakshatras: NakshatraData[];
  yogas: YogaData[];
}

export interface DashaData {
  planet: string;
  startDate: Date;
  endDate: Date;
  level: "maha" | "antar" | "pratyantar";
  subDashas?: DashaData[];
}

export interface NakshatraData {
  name: string;
  ruler: string;
  degree: number;
  pada: number;
  characteristics: string[];
}

export interface YogaData {
  name: string;
  type: string;
  planets: string[];
  strength: number;
  description: string;
}

export interface ChineseData {
  fourPillars: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  elements: {
    primary: string;
    secondary: string;
    balance: Record<string, number>;
  };
  animalSigns: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  luckyElements: string[];
  unluckyElements: string[];
}

export interface HellenisticData {
  lots: LotData[];
  rulers: RulerData[];
  bounds: BoundData[];
  decans: DecanData[];
  temperament: TemperamentData;
}

export interface LotData {
  name: string;
  position: {
    sign: string;
    degree: number;
    house: number;
  };
  ruler: string;
  interpretation: string;
}

export interface RulerData {
  house: number;
  ruler: string;
  condition: string;
  aspects: string[];
}

export interface BoundData {
  planet: string;
  sign: string;
  degrees: { start: number; end: number };
}

export interface DecanData {
  sign: string;
  decan: number;
  ruler: string;
  degrees: { start: number; end: number };
}

export interface TemperamentData {
  primary: "hot" | "cold" | "wet" | "dry";
  secondary: "hot" | "cold" | "wet" | "dry";
  balance: Record<string, number>;
  constitution: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  category: "personal" | "professional" | "premium" | "system";
  sections: ReportSection[];
  styles: TemplateStyles;
  layout: "single-column" | "two-column" | "magazine" | "grid";
  theme: TemplateTheme;
  isPublic: boolean;
  isDefault: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating?: number;
  tags: string[];
  preview?: TemplatePreview;
}

export interface TemplateTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: string;
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface TemplateStyles {
  css: string;
  customProperties: Record<string, string>;
  responsive: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export interface TemplatePreview {
  thumbnail: string;
  screenshots: string[];
  description: string;
}

export interface TemplateSection {
  id: string;
  name: string;
  type: "header" | "content" | "chart" | "table" | "footer" | "custom";
  component: string;
  props: Record<string, any>;
  order: number;
  isRequired: boolean;
  isCustomizable: boolean;
  styles?: Record<string, string>;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: ReportTemplate[];
}

export interface TemplateCustomization {
  templateId: string;
  userId: string;
  customizations: {
    theme?: Partial<TemplateTheme>;
    sections?: TemplateSection[];
    layout?: ReportTemplate["layout"];
    styles?: Partial<TemplateStyles>;
  };
  name: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateUsage {
  templateId: string;
  userId: string;
  reportId: string;
  usedAt: Date;
  customizations?: TemplateCustomization;
}

export interface TemplateRating {
  templateId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: Date;
}

export interface ReportError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Report Comparison Types
export interface ReportComparison {
  id: string;
  name: string;
  reports: GeneratedReport[];
  comparisonType: "side-by-side" | "overlay" | "tabbed";
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  settings: ComparisonSettings;
}

export interface ComparisonSettings {
  highlightDifferences: boolean;
  showSimilarities: boolean;
  compareFields: ComparisonField[];
  syncScrolling: boolean;
  showMetadata: boolean;
  colorScheme: "default" | "high-contrast" | "colorblind-friendly";
}

export interface ComparisonField {
  field: string;
  weight: number;
  enabled: boolean;
  displayName: string;
}

export interface ComparisonResult {
  similarities: ComparisonMatch[];
  differences: ComparisonDifference[];
  overallSimilarity: number;
  fieldComparisons: FieldComparison[];
}

export interface ComparisonMatch {
  field: string;
  value: string;
  confidence: number;
  reports: string[]; // report IDs
  position?: TextPosition;
}

export interface ComparisonDifference {
  field: string;
  values: { reportId: string; value: string; position?: TextPosition }[];
  significance: "high" | "medium" | "low";
  category: string;
}

export interface FieldComparison {
  field: string;
  similarity: number;
  differences: number;
  matches: number;
}

export interface TextPosition {
  start: number;
  end: number;
  line?: number;
  column?: number;
}

// Report Annotation Types
export interface ReportAnnotation {
  id: string;
  reportId: string;
  userId: string;
  type: "highlight" | "note" | "bookmark" | "comment";
  content: string;
  position: AnnotationPosition;
  style: AnnotationStyle;
  isPrivate: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  parentId?: string; // for threaded comments
  resolved?: boolean;
}

export interface AnnotationPosition {
  selector: string; // CSS selector or XPath
  textRange?: {
    start: number;
    end: number;
    text: string;
  };
  coordinates?: {
    x: number;
    y: number;
  };
  page?: number;
  section?: string;
}

export interface AnnotationStyle {
  color: string;
  backgroundColor?: string;
  borderColor?: string;
  opacity?: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  textDecoration?: "underline" | "strikethrough" | "none";
}

export interface AnnotationCollection {
  id: string;
  name: string;
  description?: string;
  annotations: ReportAnnotation[];
  userId: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationFilter {
  type?: ReportAnnotation["type"][];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  author?: string;
  resolved?: boolean;
  searchTerm?: string;
}

export interface AnnotationExport {
  format: "json" | "csv" | "pdf" | "html";
  includeContent: boolean;
  includeMetadata: boolean;
  groupBy?: "type" | "date" | "section" | "tag";
}

// Collaboration Types
export interface CollaborativeAnnotation extends ReportAnnotation {
  collaborators: AnnotationCollaborator[];
  permissions: AnnotationPermissions;
  version: number;
  history: AnnotationHistory[];
}

export interface AnnotationCollaborator {
  userId: string;
  role: "owner" | "editor" | "viewer";
  addedAt: Date;
  lastActive?: Date;
}

export interface AnnotationPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canComment: boolean;
}

export interface AnnotationHistory {
  id: string;
  action: "created" | "updated" | "deleted" | "shared";
  userId: string;
  timestamp: Date;
  changes?: Record<string, any>;
  comment?: string;
}

// Utility types
export type ReportStatus = "pending" | "generating" | "completed" | "failed";

export type ReportFormat = "html" | "pdf" | "json" | "xml";

export type ReportDelivery = "immediate" | "email" | "download";

// Event types for report generation
export interface ReportGenerationEvent {
  type: "start" | "progress" | "complete" | "error";
  reportId: string;
  data?: any;
  timestamp: Date;
}

// Configuration for batch report generation
export interface BatchReportConfig {
  maxConcurrent: number;
  retryAttempts: number;
  timeout: number;
  onProgress?: (completed: number, total: number) => void;
  onError?: (error: ReportError, reportIndex: number) => void;
}

// Report sharing and collaboration
export interface ReportShare {
  id: string;
  reportId: string;
  shareType: "public" | "private" | "password";
  password?: string;
  expiresAt?: Date;
  permissions: {
    view: boolean;
    download: boolean;
    comment: boolean;
  };
}

// Report analytics and tracking
export interface ReportAnalytics {
  reportId: string;
  views: number;
  downloads: number;
  shares: number;
  averageReadTime: number;
  popularSections: string[];
  userFeedback: {
    rating: number;
    comments: string[];
  };
}

// Enhanced analytics types
export interface ReportInteraction {
  type:
    | "view"
    | "scroll"
    | "search"
    | "bookmark"
    | "share"
    | "export"
    | "print"
    | "zoom"
    | "toc_navigation"
    | "text_to_speech"
    | "annotation"
    | "comparison"
    | "highlight"
    | "note_creation";
  timestamp: number;
  data?: any;
}

export interface ReportEngagementMetrics {
  totalViews: number;
  averageReadingTime: number;
  averageCompletionRate: number;
  popularSections: { section: string; views: number }[];
  interactionTypes: { type: string; count: number }[];
  exportCount: number;
  shareCount: number;
  bookmarkCount: number;
}

export interface UserReadingStats {
  totalReadingTime: number; // in minutes
  averageCompletionRate: number;
  totalWordsRead: number;
  averageReadingSpeed: number; // words per minute
  reportsRead: number;
}

export interface ReportBookmark {
  id: string;
  user_id: string;
  report_id: string;
  created_at: string;
}

export interface ReportExportEvent {
  id: string;
  user_id: string;
  report_id: string;
  export_type: "pdf" | "html" | "docx";
  device_type: string;
  created_at: string;
}

export interface ReportShareEvent {
  id: string;
  user_id: string;
  report_id: string;
  share_method: "native" | "copy" | "email" | "social";
  device_type: string;
  created_at: string;
}
