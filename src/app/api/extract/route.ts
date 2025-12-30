import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument, parseTextractBlocks } from '@/lib/textract';
import { convertToPdf, isPdf, isSupportedDocumentType } from '@/lib/documentConverter';
import { ExtractResponse } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 120; // 120 second timeout for conversion + Textract

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json<ExtractResponse>(
        { success: false, fields: [], pageCount: 0, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const filename = file.name;
    if (!isPdf(filename) && !isSupportedDocumentType(filename)) {
      return NextResponse.json<ExtractResponse>(
        { success: false, fields: [], pageCount: 0, error: 'Unsupported file type. Please upload PDF, DOCX, DOC, ODT, RTF, TXT, XLSX, XLS, PPTX, or PPT.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer);
    let processedFilename = filename;
    let wasConverted = false;

    // Convert non-PDF documents to PDF first
    if (!isPdf(filename)) {
      console.log(`Converting ${filename} to PDF...`);
      try {
        const result = await convertToPdf(buffer, filename);
        buffer = Buffer.from(result.pdfBuffer);
        processedFilename = result.convertedFilename;
        wasConverted = true;
        console.log(`Conversion successful: ${processedFilename}`);
      } catch (error: any) {
        console.error('Document conversion failed:', error);
        return NextResponse.json<ExtractResponse>(
          { success: false, fields: [], pageCount: 0, error: `Document conversion failed: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Check file size (Textract limit is 5MB for sync API)
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json<ExtractResponse>(
        { success: false, fields: [], pageCount: 0, error: 'PDF must be under 5MB for direct processing' },
        { status: 400 }
      );
    }

    console.log(`Processing PDF: ${processedFilename}, size: ${buffer.length} bytes`);

    // Analyze with Textract (handles multi-page PDFs)
    const { blocks, pageCount } = await analyzeDocument(buffer, processedFilename);
    console.log(`Textract returned ${blocks.length} blocks across ${pageCount} page(s)`);

    // Parse blocks into fields
    const fields = parseTextractBlocks(blocks);
    console.log(`Extracted ${fields.length} fields`);

    // Build response - include PDF data if file was converted
    const response: ExtractResponse = {
      success: true,
      fields,
      pageCount,
      wasConverted,
    };

    // If file was converted, include the PDF as base64 so frontend can display it
    if (wasConverted) {
      response.pdfBase64 = buffer.toString('base64');
    }

    return NextResponse.json<ExtractResponse>(response);

  } catch (error) {
    console.error('Extraction error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json<ExtractResponse>(
      { success: false, fields: [], pageCount: 0, error: errorMessage },
      { status: 500 }
    );
  }
}
