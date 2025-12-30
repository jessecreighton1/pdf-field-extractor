import { PDFDocument, StandardFonts } from 'pdf-lib';
import { ExtractedField } from '@/types';

export async function createFillablePdf(
  originalPdfBytes: ArrayBuffer,
  fields: ExtractedField[]
): Promise<Uint8Array> {
  // Load the original PDF
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Get page dimensions for coordinate conversion
  const pages = pdfDoc.getPages();

  // Group fields by page
  const fieldsByPage = new Map<number, ExtractedField[]>();
  fields.forEach(field => {
    const pageFields = fieldsByPage.get(field.page) || [];
    pageFields.push(field);
    fieldsByPage.set(field.page, pageFields);
  });

  // Process each page's fields
  fieldsByPage.forEach((pageFields, pageNum) => {
    const page = pages[pageNum - 1]; // Pages are 0-indexed
    if (!page) return;

    const { width: pageWidth, height: pageHeight } = page.getSize();

    pageFields.forEach((field, index) => {
      // Convert percentage coordinates to PDF points
      // Note: PDF coordinates are from bottom-left, our coords are from top-left
      const x = (field.boundingBox.x / 100) * pageWidth;
      const y = pageHeight - ((field.boundingBox.y / 100) * pageHeight) - ((field.boundingBox.height / 100) * pageHeight);
      const width = (field.boundingBox.width / 100) * pageWidth;
      const height = (field.boundingBox.height / 100) * pageHeight;

      // Create unique field name
      const fieldName = sanitizeFieldName(`${field.label}_${pageNum}_${index}`);

      try {
        switch (field.type) {
          case 'checkbox': {
            const checkbox = form.createCheckBox(fieldName);
            checkbox.addToPage(page, {
              x,
              y,
              width: Math.min(width, height), // Keep checkbox square
              height: Math.min(width, height),
            });
            if (field.value === 'checked') {
              checkbox.check();
            }
            break;
          }

          case 'signature': {
            // Create a text field with signature styling
            // Note: True digital signatures require certificates
            const sigField = form.createTextField(fieldName);
            sigField.addToPage(page, {
              x,
              y,
              width,
              height,
              borderWidth: 0,
            });
            sigField.setFontSize(10);
            sigField.setText(field.value || '');
            break;
          }

          case 'date': {
            const dateField = form.createTextField(fieldName);
            dateField.addToPage(page, {
              x,
              y,
              width,
              height,
              borderWidth: 0,
            });
            dateField.setFontSize(calculateFontSize(height));
            dateField.setText(field.value || '');
            break;
          }

          case 'dropdown': {
            // PDF dropdowns need predefined options
            // For now, create as text field since we don't have options
            const dropdownField = form.createTextField(fieldName);
            dropdownField.addToPage(page, {
              x,
              y,
              width,
              height,
              borderWidth: 0,
            });
            dropdownField.setFontSize(calculateFontSize(height));
            dropdownField.setText(field.value || '');
            break;
          }

          case 'text':
          default: {
            const textField = form.createTextField(fieldName);

            // Check if this looks like a multi-line field (tall)
            const isMultiLine = height > 30;

            textField.addToPage(page, {
              x,
              y,
              width,
              height,
              borderWidth: 0,
            });

            if (isMultiLine) {
              textField.enableMultiline();
            }

            textField.setFontSize(calculateFontSize(height));
            textField.setText(field.value || '');
            break;
          }
        }
      } catch (error) {
        console.warn(`Failed to create field "${fieldName}":`, error);
      }
    });
  });

  // Save and return the modified PDF
  return pdfDoc.save();
}

// Calculate appropriate font size based on field height
function calculateFontSize(height: number): number {
  // Aim for font size that fits well within the field
  const fontSize = Math.max(8, Math.min(14, height * 0.6));
  return Math.round(fontSize);
}

// Sanitize field name for PDF form fields
function sanitizeFieldName(name: string): string {
  // Remove or replace invalid characters
  return name
    .replace(/[^\w\s-]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 50); // Limit length
}

// Helper to convert fields to a summary for display
export function getFieldsSummary(fields: ExtractedField[]): {
  total: number;
  byType: Record<string, number>;
} {
  const byType: Record<string, number> = {};

  fields.forEach(field => {
    byType[field.type] = (byType[field.type] || 0) + 1;
  });

  return {
    total: fields.length,
    byType,
  };
}
