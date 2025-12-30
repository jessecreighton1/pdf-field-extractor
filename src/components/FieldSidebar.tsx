'use client';

import { useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { ExtractedField, FieldType } from '@/types';
import { createFillablePdf } from '@/lib/pdfExport';
import { cn } from '@/lib/cn';
import {
  Button,
  Input,
  Label,
  Select,
  TypographyH4,
  TypographyP,
  TypographyP2,
  TypographyCaption,
} from '@/components/design-system';

const fieldTypes: { value: FieldType; label: string; icon: string }[] = [
  { value: 'text', label: 'Text', icon: 'T' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑' },
  { value: 'signature', label: 'Signature', icon: '✍' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'dropdown', label: 'Dropdown', icon: '▼' },
];

export function FieldSidebar() {
  const {
    fields,
    selectedFieldId,
    selectField,
    updateField,
    deleteField,
    currentPage,
    pdfFile,
  } = useDocumentStore();

  const [isExporting, setIsExporting] = useState(false);

  const currentPageFields = fields.filter(f => f.page === currentPage);
  const selectedField = fields.find(f => f.id === selectedFieldId);

  const handleExportJson = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      fields: fields.map(({ id, type, label, value, boundingBox, page, confidence }) => ({
        id,
        type,
        label,
        value,
        boundingBox,
        page,
        confidence: Math.round(confidence),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-fields.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFillablePdf = async () => {
    if (!pdfFile || fields.length === 0) return;

    setIsExporting(true);
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const fillablePdfBytes = await createFillablePdf(pdfBytes, fields);
      const blob = new Blob([fillablePdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFile.name.replace('.pdf', '-fillable.pdf');
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export fillable PDF:', error);
      alert('Failed to create fillable PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-80 bg-background-secondary border-l border-border-default flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border-default bg-background-tertiary">
        <div className="flex items-center justify-between">
          <TypographyH4>Fields</TypographyH4>
          <TypographyCaption className="text-text-tertiary">
            {currentPageFields.length} on this page
          </TypographyCaption>
        </div>
      </div>

      {/* Field Editor (when selected) */}
      {selectedField && (
        <div className="p-4 border-b border-border-default bg-background-tertiary-hover">
          <div className="flex items-center justify-between mb-4">
            <TypographyP className="font-medium">Edit Field</TypographyP>
            <button
              onClick={() => selectField(null)}
              className="text-text-disabled hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Type selector */}
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select
                value={selectedField.type}
                onChange={(e) => updateField(selectedField.id, { type: e.target.value as FieldType })}
              >
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Label */}
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                type="text"
                value={selectedField.label}
                onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
              />
            </div>

            {/* Value */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                {selectedField.type === 'checkbox' ? 'Status' : 'Value'}
              </Label>
              {selectedField.type === 'checkbox' ? (
                <Select
                  value={selectedField.value}
                  onChange={(e) => updateField(selectedField.id, { value: e.target.value })}
                >
                  <option value="unchecked">Unchecked</option>
                  <option value="checked">Checked</option>
                </Select>
              ) : (
                <Input
                  type="text"
                  value={selectedField.value}
                  onChange={(e) => updateField(selectedField.id, { value: e.target.value })}
                />
              )}
            </div>

            {/* Confidence & Delete */}
            <div className="flex items-center justify-between pt-2">
              <TypographyCaption className="text-text-tertiary">
                Confidence: {Math.round(selectedField.confidence)}%
              </TypographyCaption>
              <button
                onClick={() => deleteField(selectedField.id)}
                className="text-xs text-validation-destructive hover:text-validation-destructive/80 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field List */}
      <div className="flex-1 overflow-auto">
        {currentPageFields.length === 0 ? (
          <div className="p-6 text-center">
            <TypographyP2 className="text-text-tertiary">
              No fields detected on this page.
            </TypographyP2>
            <TypographyCaption className="mt-1 text-text-disabled">
              Double-click on the PDF to add fields manually.
            </TypographyCaption>
          </div>
        ) : (
          <ul className="divide-y divide-border-default">
            {currentPageFields.map((field) => (
              <FieldListItem
                key={field.id}
                field={field}
                isSelected={field.id === selectedFieldId}
                onClick={() => selectField(field.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Export Buttons */}
      <div className="p-4 border-t border-border-default bg-background-tertiary space-y-2">
        <Button
          onClick={handleExportFillablePdf}
          disabled={fields.length === 0 || !pdfFile || isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-sunlight border-t-transparent rounded-full mr-2" />
              Creating PDF...
            </>
          ) : (
            'Export Fillable PDF'
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={handleExportJson}
          disabled={fields.length === 0}
          className="w-full"
          size="sm"
        >
          Export JSON ({fields.length} fields)
        </Button>
      </div>
    </div>
  );
}

interface FieldListItemProps {
  field: ExtractedField;
  isSelected: boolean;
  onClick: () => void;
}

function FieldListItem({ field, isSelected, onClick }: FieldListItemProps) {
  const typeConfig = fieldTypes.find(t => t.value === field.type) || fieldTypes[0];

  return (
    <li
      onClick={onClick}
      className={cn(
        'p-3 cursor-pointer transition-all duration-200',
        isSelected
          ? 'bg-background-tertiary-hover'
          : 'hover:bg-background-tertiary'
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn(
          'text-lg w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isSelected ? 'bg-background-primary text-text-primary-invert' : 'bg-background-tertiary'
        )}>
          {typeConfig.icon}
        </span>
        <div className="flex-1 min-w-0">
          <TypographyP2 className="font-medium truncate">
            {field.label}
          </TypographyP2>
          <TypographyCaption className="text-text-tertiary truncate">
            {field.type === 'checkbox'
              ? field.value === 'checked' ? '✓ Checked' : '○ Unchecked'
              : field.value || '(empty)'}
          </TypographyCaption>
        </div>
        {field.confidence < 70 && (
          <span
            className="w-2 h-2 bg-validation-warning rounded-full flex-shrink-0 mt-2"
            title={`Low confidence: ${Math.round(field.confidence)}%`}
          />
        )}
      </div>
    </li>
  );
}
