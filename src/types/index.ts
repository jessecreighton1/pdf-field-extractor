export type FieldType = 'text' | 'checkbox' | 'signature' | 'date' | 'dropdown';

export interface BoundingBox {
  x: number;      // % from left (0-100)
  y: number;      // % from top (0-100)
  width: number;  // % width (0-100)
  height: number; // % height (0-100)
}

export interface ExtractedField {
  id: string;
  type: FieldType;
  label: string;
  value: string;
  boundingBox: BoundingBox;
  page: number;
  confidence: number; // 0-100
}

export interface DocumentState {
  pdfFile: File | null;
  pdfUrl: string | null;
  fields: ExtractedField[];
  selectedFieldId: string | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
}

export interface TextractBlock {
  BlockType: string;
  Id: string;
  Text?: string;
  Confidence?: number;
  Geometry?: {
    BoundingBox: {
      Width: number;
      Height: number;
      Left: number;
      Top: number;
    };
  };
  Relationships?: Array<{
    Type: string;
    Ids: string[];
  }>;
  EntityTypes?: string[];
  SelectionStatus?: 'SELECTED' | 'NOT_SELECTED';
}

export interface ExtractResponse {
  success: boolean;
  fields: ExtractedField[];
  pageCount: number;
  error?: string;
  pdfBase64?: string; // Base64 encoded PDF (for converted documents)
  wasConverted?: boolean; // True if the file was converted from another format
}
