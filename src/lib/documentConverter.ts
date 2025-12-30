/**
 * Document converter - converts various document types to PDF
 * Uses LibreOffice CLI for conversion
 */

const SUPPORTED_EXTENSIONS = ['.docx', '.doc', '.odt', '.rtf', '.txt', '.xlsx', '.xls', '.pptx', '.ppt'];

export function isSupportedDocumentType(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return SUPPORTED_EXTENSIONS.includes(ext);
}

export function isPdf(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf');
}

export async function convertToPdf(
  buffer: Buffer,
  filename: string
): Promise<{ pdfBuffer: Buffer; convertedFilename: string }> {
  const { spawn } = await import('child_process');
  const fs = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');

  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);

  const tempInputPath = path.join(tempDir, `input-${timestamp}${ext}`);
  const tempOutputDir = tempDir;
  const expectedOutputPath = path.join(tempOutputDir, `input-${timestamp}.pdf`);

  try {
    // Write input file to temp location
    await fs.writeFile(tempInputPath, buffer);

    // Convert using LibreOffice
    await new Promise<void>((resolve, reject) => {
      const proc = spawn('soffice', [
        '--headless',
        '--convert-to', 'pdf',
        '--outdir', tempOutputDir,
        tempInputPath,
      ]);

      let stderr = '';
      proc.stderr.on('data', (data) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`LibreOffice conversion failed (code ${code}): ${stderr}`));
      });

      proc.on('error', (err) => {
        reject(new Error(`LibreOffice not found. Please install LibreOffice to convert documents. Error: ${err.message}`));
      });
    });

    // Read the converted PDF
    const pdfBuffer = await fs.readFile(expectedOutputPath);

    // Clean up temp files
    await fs.unlink(tempInputPath).catch(() => {});
    await fs.unlink(expectedOutputPath).catch(() => {});

    return {
      pdfBuffer,
      convertedFilename: `${baseName}.pdf`,
    };
  } catch (error) {
    // Clean up on error
    await fs.unlink(tempInputPath).catch(() => {});
    await fs.unlink(expectedOutputPath).catch(() => {});
    throw error;
  }
}

export function getSupportedExtensions(): string[] {
  return [...SUPPORTED_EXTENSIONS, '.pdf'];
}
