import { create } from 'zustand';
import { DocumentState, ExtractedField, FieldType, BoundingBox } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface DocumentStore extends DocumentState {
  // Actions
  setPdfFile: (file: File) => void;
  setFields: (fields: ExtractedField[]) => void;
  selectField: (id: string | null) => void;
  updateField: (id: string, updates: Partial<ExtractedField>) => void;
  deleteField: (id: string) => void;
  addField: (type: FieldType, boundingBox: BoundingBox, page: number) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  reset: () => void;
  // Loading message for better UX
  loadingMessage: string;
}

const initialState: DocumentState & { loadingMessage: string } = {
  pdfFile: null,
  pdfUrl: null,
  fields: [],
  selectedFieldId: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  loadingMessage: '',
};

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  ...initialState,

  setPdfFile: (file: File) => {
    // Revoke old URL if exists
    const oldUrl = get().pdfUrl;
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }

    const url = URL.createObjectURL(file);
    set({
      pdfFile: file,
      pdfUrl: url,
      fields: [],
      selectedFieldId: null,
      error: null,
      currentPage: 1,
    });
  },

  setFields: (fields: ExtractedField[]) => {
    set({ fields });
  },

  selectField: (id: string | null) => {
    set({ selectedFieldId: id });
  },

  updateField: (id: string, updates: Partial<ExtractedField>) => {
    set((state) => ({
      fields: state.fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      ),
    }));
  },

  deleteField: (id: string) => {
    set((state) => ({
      fields: state.fields.filter((field) => field.id !== id),
      selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
    }));
  },

  addField: (type: FieldType, boundingBox: BoundingBox, page: number) => {
    const newField: ExtractedField = {
      id: uuidv4(),
      type,
      label: `New ${type} field`,
      value: '',
      boundingBox,
      page,
      confidence: 100, // Manual fields have 100% confidence
    };
    set((state) => ({
      fields: [...state.fields, newField],
      selectedFieldId: newField.id,
    }));
  },

  setLoading: (isLoading: boolean, message?: string) => {
    set({ isLoading, loadingMessage: message || '' });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  setCurrentPage: (currentPage: number) => {
    set({ currentPage });
  },

  setTotalPages: (totalPages: number) => {
    set({ totalPages });
  },

  reset: () => {
    const oldUrl = get().pdfUrl;
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }
    set(initialState);
  },
}));
