export interface ImageState {
  original: string | null;
  restored: string | null;
  mimeType: string | null;
  fileName: string | null;
  imageId?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE',
  RESTORING = 'RESTORING',
  VALIDATING = 'VALIDATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface Defect {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  estimatedFixTime: 'QUICK' | 'MODERATE' | 'COMPLEX';
}

export interface AnalysisResult {
  defects: Defect[];
  overallCondition: string;
  recommendations: string[];
  colorAnalysis: {
    saturationLevel: string;
    contrastLevel: string;
    whiteBalance: string;
    colorCast: string;
  };
  elementInventory?: {
    people?: Array<{
      count: number;
      description: string;
      facialFeatures?: string;
    }>;
    objects?: Array<{
      type: string;
      description: string;
      count: number;
    }>;
    backgroundElements?: Array<{
      type: string;
      description: string;
      prominentFeatures?: string[];
    }>;
    composition?: {
      framing: string;
      perspective: string;
      keyElements: string[];
    };
  };
}

export interface RestorationOptions {
  defectsToFix: string[];
  enhanceColors: boolean;
  preserveOriginal: boolean;
}

export interface ValidationResult {
  contentValidation: {
    hasAddedElements: string;
    hasRemovedElements: string;
    hasAlteredFaces: string;
    hasChangedComposition: string;
    fidelityScore: number;
    fineGrainedAttributeChanges?: Array<{
      area: 'hands' | 'nails' | 'clothing' | 'face' | 'hair' | 'background' | 'other';
      change: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    issuesFound: string[];
    validationPassed: string;
  };
  elementComparison?: {
    peopleCount: {
      original: number;
      restored: number;
      match: boolean;
    };
    objectsCount: {
      original: number;
      restored: number;
      match: boolean;
    };
    addedElements: string[];
    removedElements: string[];
    alteredElements: string[];
  };
  overallResult: string;
  confidenceScore: number;
}