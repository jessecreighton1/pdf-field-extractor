'use client';

import dynamic from 'next/dynamic';
import { useDocumentStore } from '@/store/documentStore';
import { UploadZone } from '@/components/UploadZone';
import { FieldSidebar } from '@/components/FieldSidebar';
import {
  Button,
  TypographyH3,
  TypographyP2,
  TypographyCaption,
  LoadingSpinner,
} from '@/components/design-system';

// Dynamic import to avoid SSR issues with react-pdf
const PdfViewer = dynamic(() => import('@/components/PdfViewer').then(mod => ({ default: mod.PdfViewer })), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-sand/50">
      <LoadingSpinner size="lg" aria-label="Loading PDF viewer" />
    </div>
  ),
});

export default function Home() {
  const { pdfUrl, isLoading, loadingMessage, error, fields, reset } = useDocumentStore();

  return (
    <div className="h-screen flex flex-col bg-sand">
      {/* Header */}
      <header className="bg-surface border-b border-bark/10 px-6 py-4 flex items-center justify-between">
        <div>
          <TypographyH3 className="text-bark">PDF Field Extractor</TypographyH3>
          <TypographyP2 className="text-bark/60">
            Extract and edit form fields from PDFs
          </TypographyP2>
        </div>

        {pdfUrl && (
          <Button variant="secondary" size="sm" onClick={reset}>
            Upload New PDF
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {!pdfUrl ? (
          // Upload Screen
          <div className="h-full flex items-center justify-center p-8">
            <div className="w-full max-w-xl">
              <UploadZone />

              {isLoading && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-sunlight/30 text-bark rounded-full">
                    <LoadingSpinner size="sm" aria-label="Processing document" />
                    <TypographyP2>{loadingMessage || 'Processing...'}</TypographyP2>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-failure/10 border border-failure/30 rounded-lg text-failure text-center">
                  <TypographyP2>{error}</TypographyP2>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Editor Screen
          <div className="h-full flex">
            {/* PDF Viewer */}
            <div className="flex-1 min-w-0 bg-sand/50">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" aria-label="Analyzing document" />
                    <TypographyP2 className="text-bark/60">Analyzing document...</TypographyP2>
                  </div>
                </div>
              ) : (
                <PdfViewer />
              )}
            </div>

            {/* Sidebar */}
            <FieldSidebar />
          </div>
        )}
      </main>

      {/* Status Bar */}
      {pdfUrl && !isLoading && (
        <footer className="bg-surface border-t border-bark/10 px-4 py-2 flex items-center justify-between">
          <TypographyCaption className="text-bark/60">
            {fields.length} field{fields.length !== 1 ? 's' : ''} detected
          </TypographyCaption>
          {fields.filter(f => f.confidence < 70).length > 0 && (
            <TypographyCaption className="text-progress">
              {fields.filter(f => f.confidence < 70).length} low confidence
            </TypographyCaption>
          )}
        </footer>
      )}
    </div>
  );
}
