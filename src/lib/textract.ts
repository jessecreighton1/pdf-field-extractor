import { TextractClient, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import { ExtractedField, TextractBlock, FieldType } from '@/types';

// Initialize clients
const textractClient = new TextractClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.S3_BUCKET_NAME!;

export async function uploadToS3(buffer: Buffer, filename: string, contentType: string = 'application/pdf'): Promise<string> {
  const key = `temp/${uuidv4()}-${filename}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return key;
}

export async function deleteFromS3(key: string): Promise<void> {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));
  } catch (e) {
    console.error('Failed to delete from S3:', e);
  }
}

// Try to analyze with bytes directly first (faster)
export async function analyzeDocumentWithBytes(buffer: Buffer): Promise<TextractBlock[]> {
  const command = new AnalyzeDocumentCommand({
    Document: {
      Bytes: buffer,
    },
    FeatureTypes: ['FORMS', 'TABLES'],
  });

  const response = await textractClient.send(command);
  return (response.Blocks || []) as TextractBlock[];
}

// Fallback to S3-based analysis
export async function analyzeDocumentFromS3(s3Key: string): Promise<TextractBlock[]> {
  const command = new AnalyzeDocumentCommand({
    Document: {
      S3Object: {
        Bucket: bucketName,
        Name: s3Key,
      },
    },
    FeatureTypes: ['FORMS', 'TABLES'],
  });

  const response = await textractClient.send(command);
  return (response.Blocks || []) as TextractBlock[];
}

// Analyze a single page (used internally)
async function analyzeSinglePage(pdfBuffer: Buffer, filename: string): Promise<TextractBlock[]> {
  // Strategy 1: Try bytes directly (works for most PDFs)
  try {
    console.log('Trying direct bytes analysis...');
    return await analyzeDocumentWithBytes(pdfBuffer);
  } catch (error: any) {
    console.log('Direct bytes failed:', error.name || error.message);

    // If it's not an unsupported format error, rethrow
    if (error.name !== 'UnsupportedDocumentException' &&
        !error.message?.includes('unsupported')) {
      throw error;
    }
  }

  // Strategy 2: Try via S3 (sometimes works when bytes don't)
  let s3Key: string | null = null;
  try {
    console.log('Trying S3-based analysis...');
    s3Key = await uploadToS3(pdfBuffer, filename);
    const result = await analyzeDocumentFromS3(s3Key);
    await deleteFromS3(s3Key);
    return result;
  } catch (error: any) {
    if (s3Key) await deleteFromS3(s3Key);
    console.log('S3 analysis failed:', error.name || error.message);

    if (error.name !== 'UnsupportedDocumentException' &&
        !error.message?.includes('unsupported')) {
      throw error;
    }
  }

  // Strategy 3: Convert PDF to PNG and analyze the image
  console.log('Converting PDF to image for analysis...');
  const pngBuffer = await convertPdfToImage(pdfBuffer);

  try {
    console.log('Analyzing converted image...');
    return await analyzeDocumentWithBytes(pngBuffer);
  } catch (error: any) {
    // Try via S3 as last resort
    console.log('Image bytes failed, trying S3...');
    s3Key = await uploadToS3(pngBuffer, filename.replace('.pdf', '.png'), 'image/png');
    try {
      const result = await analyzeDocumentFromS3(s3Key);
      await deleteFromS3(s3Key);
      return result;
    } finally {
      if (s3Key) await deleteFromS3(s3Key);
    }
  }
}

// Split PDF into individual pages
async function splitPdfIntoPages(pdfBuffer: Buffer): Promise<Buffer[]> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageCount = pdfDoc.getPageCount();
  const pageBuffers: Buffer[] = [];

  for (let i = 0; i < pageCount; i++) {
    const singlePageDoc = await PDFDocument.create();
    const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]);
    singlePageDoc.addPage(copiedPage);
    const pdfBytes = await singlePageDoc.save();
    pageBuffers.push(Buffer.from(pdfBytes));
  }

  return pageBuffers;
}

// Main analysis function - handles multi-page PDFs
export async function analyzeDocument(
  pdfBuffer: Buffer,
  filename: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ blocks: TextractBlock[]; pageCount: number }> {
  // Get page count
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageCount = pdfDoc.getPageCount();

  console.log(`PDF has ${pageCount} page(s)`);

  if (pageCount === 1) {
    // Single page - use original approach
    const blocks = await analyzeSinglePage(pdfBuffer, filename);
    return { blocks, pageCount: 1 };
  }

  // Multi-page - split and analyze each page
  console.log('Splitting PDF into individual pages...');
  const pageBuffers = await splitPdfIntoPages(pdfBuffer);

  const allBlocks: TextractBlock[] = [];

  for (let i = 0; i < pageBuffers.length; i++) {
    const pageNum = i + 1;
    console.log(`Analyzing page ${pageNum} of ${pageCount}...`);
    onProgress?.(pageNum, pageCount);

    try {
      const blocks = await analyzeSinglePage(pageBuffers[i], `${filename}-page${pageNum}.pdf`);
      // Add page number to each block
      blocks.forEach(block => {
        (block as any).Page = pageNum;
      });
      allBlocks.push(...blocks);
    } catch (error) {
      console.error(`Failed to analyze page ${pageNum}:`, error);
      // Continue with other pages
    }
  }

  return { blocks: allBlocks, pageCount };
}

// Convert PDF to PNG using poppler's pdftoppm
async function convertPdfToImage(pdfBuffer: Buffer): Promise<Buffer> {
  const { spawn } = await import('child_process');
  const fs = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');

  // Write PDF to temp file
  const tempDir = os.tmpdir();
  const tempPdfPath = path.join(tempDir, `temp-${Date.now()}.pdf`);
  const tempPngPath = path.join(tempDir, `temp-${Date.now()}`);

  try {
    await fs.writeFile(tempPdfPath, pdfBuffer);

    // Use pdftoppm to convert first page to PNG at 300 DPI
    await new Promise<void>((resolve, reject) => {
      const proc = spawn('pdftoppm', [
        '-png',
        '-r', '300',     // 300 DPI for good OCR quality
        '-f', '1',       // First page only
        '-l', '1',       // Last page = 1 (only first page)
        '-singlefile',   // Don't add page number suffix
        tempPdfPath,
        tempPngPath,
      ]);

      let stderr = '';
      proc.stderr.on('data', (data) => { stderr += data.toString(); });
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`pdftoppm failed: ${stderr}`));
      });
      proc.on('error', reject);
    });

    // Read the PNG file
    const pngBuffer = await fs.readFile(`${tempPngPath}.png`);

    // Clean up
    await fs.unlink(tempPdfPath).catch(() => {});
    await fs.unlink(`${tempPngPath}.png`).catch(() => {});

    return pngBuffer;
  } catch (error) {
    // Clean up on error
    await fs.unlink(tempPdfPath).catch(() => {});
    await fs.unlink(`${tempPngPath}.png`).catch(() => {});
    throw error;
  }
}

export function parseTextractBlocks(blocks: TextractBlock[]): ExtractedField[] {
  const fields: ExtractedField[] = [];
  const blockMap = new Map<string, TextractBlock>();

  // Build block lookup map
  blocks.forEach(block => {
    blockMap.set(block.Id, block);
  });

  // Find KEY_VALUE_SET blocks (form fields)
  const keyBlocks = blocks.filter(
    block => block.BlockType === 'KEY_VALUE_SET' && block.EntityTypes?.includes('KEY')
  );

  keyBlocks.forEach(keyBlock => {
    // Find the VALUE block linked to this KEY
    const valueRelation = keyBlock.Relationships?.find(r => r.Type === 'VALUE');
    if (!valueRelation) return;

    const valueBlockId = valueRelation.Ids[0];
    const valueBlock = blockMap.get(valueBlockId);
    if (!valueBlock) return;

    // Get the label text from KEY block's CHILD relationship
    const keyChildRelation = keyBlock.Relationships?.find(r => r.Type === 'CHILD');
    let labelText = '';
    if (keyChildRelation) {
      labelText = keyChildRelation.Ids
        .map(id => blockMap.get(id)?.Text || '')
        .join(' ')
        .trim();
    }

    // Check if this is a checkbox (SELECTION_ELEMENT)
    const valueChildRelation = valueBlock.Relationships?.find(r => r.Type === 'CHILD');
    let fieldType: FieldType = 'text';
    let fieldValue = '';

    if (valueChildRelation) {
      const childBlocks = valueChildRelation.Ids.map(id => blockMap.get(id)).filter(Boolean);

      const selectionElement = childBlocks.find(b => b?.BlockType === 'SELECTION_ELEMENT');
      if (selectionElement) {
        fieldType = 'checkbox';
        fieldValue = selectionElement.SelectionStatus === 'SELECTED' ? 'checked' : 'unchecked';
      } else {
        // Regular text field
        fieldValue = childBlocks
          .map(b => b?.Text || '')
          .join(' ')
          .trim();
      }
    }

    // Get bounding box from VALUE block (where the field input area is)
    const bbox = valueBlock.Geometry?.BoundingBox;
    if (!bbox) return;

    fields.push({
      id: uuidv4(),
      type: fieldType,
      label: labelText || 'Unlabeled Field',
      value: fieldValue,
      boundingBox: {
        x: bbox.Left * 100,
        y: bbox.Top * 100,
        width: bbox.Width * 100,
        height: bbox.Height * 100,
      },
      page: (keyBlock as any).Page || 1,
      confidence: valueBlock.Confidence || 0,
    });
  });

  // Also find standalone SELECTION_ELEMENTs (checkboxes without key-value pairs)
  const standaloneSelections = blocks.filter(
    block => block.BlockType === 'SELECTION_ELEMENT' &&
    !fields.some(f => f.boundingBox.x === (block.Geometry?.BoundingBox?.Left || 0) * 100)
  );

  standaloneSelections.forEach(block => {
    const bbox = block.Geometry?.BoundingBox;
    if (!bbox) return;

    // Try to find nearby text as label
    const nearbyText = findNearbyText(blocks, bbox.Left, bbox.Top, blockMap);

    fields.push({
      id: uuidv4(),
      type: 'checkbox',
      label: nearbyText || 'Checkbox',
      value: block.SelectionStatus === 'SELECTED' ? 'checked' : 'unchecked',
      boundingBox: {
        x: bbox.Left * 100,
        y: bbox.Top * 100,
        width: bbox.Width * 100,
        height: bbox.Height * 100,
      },
      page: (block as any).Page || 1,
      confidence: block.Confidence || 0,
    });
  });

  // Sort fields by page, then position (top to bottom, left to right)
  fields.sort((a, b) => {
    // First sort by page
    if (a.page !== b.page) return a.page - b.page;
    // Then by position within page
    const yDiff = a.boundingBox.y - b.boundingBox.y;
    if (Math.abs(yDiff) > 2) return yDiff; // Different row
    return a.boundingBox.x - b.boundingBox.x; // Same row, sort by x
  });

  return fields;
}

function findNearbyText(
  blocks: TextractBlock[],
  x: number,
  y: number,
  blockMap: Map<string, TextractBlock>
): string {
  // Find LINE blocks near the selection element
  const lineBlocks = blocks.filter(b => b.BlockType === 'LINE');

  let nearestText = '';
  let nearestDistance = Infinity;

  lineBlocks.forEach(line => {
    const bbox = line.Geometry?.BoundingBox;
    if (!bbox) return;

    // Check if line is to the left of checkbox and roughly same y position
    const distance = Math.sqrt(
      Math.pow((bbox.Left + bbox.Width) - x, 2) +
      Math.pow(bbox.Top - y, 2)
    );

    if (distance < nearestDistance && distance < 0.1) { // Within 10% of page
      nearestDistance = distance;
      nearestText = line.Text || '';
    }
  });

  return nearestText;
}
