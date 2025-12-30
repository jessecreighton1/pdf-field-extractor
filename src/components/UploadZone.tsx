'use client';

import { useCallback, useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { cn } from '@/lib/cn';
import { Card } from '@/components/design-system';
import { TypographyP, TypographyP2 } from '@/components/design-system';

export function UploadZone() {
  const { setPdfFile, setLoading, setError, setFields, setTotalPages } = useDocumentStore();
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      return;
    }

    setLoading(true, 'Uploading document...');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      setLoading(true, 'Analyzing document with AI...');

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to extract fields');
      }

      setLoading(true, 'Processing extracted fields...');

      setPdfFile(file);
      setFields(data.fields);
      if (data.pageCount) {
        setTotalPages(data.pageCount);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process document');
    } finally {
      setLoading(false);
    }
  }, [setPdfFile, setLoading, setError, setFields, setTotalPages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <Card
      className={cn(
        'border-2 border-dashed transition-all duration-300 cursor-pointer',
        'p-12 text-center',
        isDragging
          ? 'border-border-selected bg-background-tertiary-hover'
          : 'border-border-default hover:border-border-selected hover:bg-background-tertiary-hover'
      )}
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          id="pdf-upload"
        />
        <label htmlFor="pdf-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-4">
            {/* Document Icon */}
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300',
              isDragging ? 'bg-background-primary' : 'bg-background-tertiary'
            )}>
              <svg
                className={cn(
                  'w-8 h-8 transition-colors duration-300',
                  isDragging ? 'text-text-primary-invert' : 'text-text-secondary'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {/* Text */}
            <div>
              <TypographyP className="font-medium">
                {isDragging ? 'Drop your PDF here' : 'Drop a PDF here or click to upload'}
              </TypographyP>
              <TypographyP2 className="mt-2">
                PDF files up to 5MB
              </TypographyP2>
            </div>
          </div>
        </label>
      </div>
    </Card>
  );
}
