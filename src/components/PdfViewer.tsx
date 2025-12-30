'use client';

import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDocumentStore } from '@/store/documentStore';
import { FieldOverlay } from './FieldOverlay';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { cn } from '@/lib/cn';
import { TypographyCaption, LoadingSpinner } from '@/components/design-system';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfViewer() {
  const {
    pdfUrl,
    fields,
    currentPage,
    setCurrentPage,
    setTotalPages,
    totalPages,
    updateField,
    addField,
    selectField,
  } = useDocumentStore();

  const [scale, setScale] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setCurrentPage(1);
  }, [setTotalPages, setCurrentPage]);

  const onPageLoadSuccess = useCallback(({ width, height }: { width: number; height: number }) => {
    setPageSize({ width, height });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;

    if (!active.data.current?.field || !pageSize.width || !pageSize.height) return;

    const field = active.data.current.field;

    // Convert pixel delta to percentage
    const deltaXPercent = (delta.x / pageSize.width) * 100;
    const deltaYPercent = (delta.y / pageSize.height) * 100;

    updateField(field.id, {
      boundingBox: {
        ...field.boundingBox,
        x: Math.max(0, Math.min(100 - field.boundingBox.width, field.boundingBox.x + deltaXPercent)),
        y: Math.max(0, Math.min(100 - field.boundingBox.height, field.boundingBox.y + deltaYPercent)),
      },
    });
  }, [pageSize, updateField]);

  const handlePageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Deselect when clicking on page background
    selectField(null);
  }, [selectField]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Add new field on double-click
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    addField('text', {
      x: Math.max(0, x - 5),
      y: Math.max(0, y - 1),
      width: 10,
      height: 2.5,
    }, currentPage);
  }, [addField, currentPage]);

  const currentPageFields = fields.filter(f => f.page === currentPage);

  if (!pdfUrl) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between p-2 bg-sand border-b border-bark/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              "bg-surface border border-bark/20 text-bark",
              "hover:bg-sunlight/30 hover:border-bark/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            ←
          </button>
          <TypographyCaption className="text-bark/70">
            Page {currentPage} of {totalPages}
          </TypographyCaption>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              "bg-surface border border-bark/20 text-bark",
              "hover:bg-sunlight/30 hover:border-bark/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            aria-label="Zoom out"
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              "bg-surface border border-bark/20 text-bark",
              "hover:bg-sunlight/30 hover:border-bark/30"
            )}
          >
            -
          </button>
          <TypographyCaption className="w-16 text-center text-bark/70">
            {Math.round(scale * 100)}%
          </TypographyCaption>
          <button
            onClick={() => setScale(Math.min(2, scale + 0.1))}
            aria-label="Zoom in"
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              "bg-surface border border-bark/20 text-bark",
              "hover:bg-sunlight/30 hover:border-bark/30"
            )}
          >
            +
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 overflow-auto bg-bark/5 p-4">
        <div className="flex justify-center">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div
              ref={containerRef}
              className="relative shadow-lg"
              onClick={handlePageClick}
              onDoubleClick={handleDoubleClick}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center w-[612px] h-[792px] bg-surface">
                    <LoadingSpinner size="lg" aria-label="Loading PDF" />
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  onLoadSuccess={onPageLoadSuccess}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              </Document>

              {/* Field Overlays */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="relative w-full h-full pointer-events-auto">
                  {currentPageFields.map((field) => (
                    <FieldOverlay key={field.id} field={field} scale={scale} />
                  ))}
                </div>
              </div>
            </div>
          </DndContext>
        </div>
      </div>

      {/* Tip */}
      <div className="p-2 bg-sand border-t border-bark/10 text-center">
        <TypographyCaption className="text-bark/50">
          Double-click to add a field • Drag fields to reposition • Click a field to select
        </TypographyCaption>
      </div>
    </div>
  );
}
