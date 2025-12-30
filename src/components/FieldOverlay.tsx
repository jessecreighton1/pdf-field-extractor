'use client';

import { ExtractedField } from '@/types';
import { useDocumentStore } from '@/store/documentStore';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/cn';

interface FieldOverlayProps {
  field: ExtractedField;
  scale: number;
}

// Heidi design system field colors - using semantic tokens
const fieldColors: Record<string, { bg: string; border: string; text: string }> = {
  text: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-600' },
  checkbox: { bg: 'bg-validation-success/20', border: 'border-validation-success', text: 'text-validation-success' },
  signature: { bg: 'bg-background-tertiary', border: 'border-border-selected', text: 'text-text-primary' },
  date: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-text-primary' },
  dropdown: { bg: 'bg-validation-warning/20', border: 'border-validation-warning', text: 'text-validation-warning' },
};

const fieldIcons: Record<string, string> = {
  text: 'T',
  checkbox: '☑',
  signature: '✍',
  date: '📅',
  dropdown: '▼',
};

export function FieldOverlay({ field, scale }: FieldOverlayProps) {
  const { selectedFieldId, selectField } = useDocumentStore();
  const isSelected = selectedFieldId === field.id;
  const colors = fieldColors[field.type] || fieldColors.text;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: field.id,
    data: { field },
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${field.boundingBox.x}%`,
    top: `${field.boundingBox.y}%`,
    width: `${field.boundingBox.width}%`,
    height: `${field.boundingBox.height}%`,
    minWidth: '20px',
    minHeight: '16px',
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : isSelected ? 100 : 10,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        selectField(field.id);
      }}
      className={cn(
        colors.bg, colors.border,
        "border-2 rounded cursor-pointer transition-all duration-150",
        "flex items-center justify-center overflow-hidden",
        isSelected ? "ring-2 ring-offset-1 ring-border-selected shadow-lg" : "hover:shadow-md",
        isDragging && "shadow-xl"
      )}
      {...listeners}
      {...attributes}
    >
      {/* Field type indicator */}
      <span className={cn(colors.text, "text-xs font-bold opacity-70")}>
        {fieldIcons[field.type]}
      </span>

      {/* Confidence indicator for low confidence fields */}
      {field.confidence < 70 && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 bg-validation-warning rounded-full"
          title={`Confidence: ${Math.round(field.confidence)}%`}
        />
      )}
    </div>
  );
}
