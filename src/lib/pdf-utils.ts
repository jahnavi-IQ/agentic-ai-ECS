//Path: src\lib\pdf-utils.ts
/**
 * PDF text extraction using unpdf
 * ESM-compatible, works with Next.js 16 Turbopack
 */
import { extractText } from 'unpdf';

export async function extractPDFText(base64Content: string): Promise<string> {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, 'base64');
    
    // Convert Buffer to Uint8Array (required by unpdf)
    const uint8Array = new Uint8Array(buffer);
    
    console.log('📄 Extracting PDF text with unpdf...');
    console.log('Buffer size:', buffer.length, 'bytes');
    console.log('Uint8Array size:', uint8Array.length, 'bytes');
    
    // Extract text using unpdf with Uint8Array
    const result = await extractText(uint8Array, {
      mergePages: true, // Combine all pages
    });
    
    console.log('✅ PDF parsed successfully');
    console.log('Pages:', result.totalPages);
    console.log('Text length:', result.text?.length || 0, 'characters');
    
    // Check if we got any text
    if (!result.text || result.text.trim().length === 0) {
      return 'PDF appears to be empty or contains only images/scanned content.';
    }
    
    return result.text;
  } catch (error) {
    console.error('❌ PDF extraction error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return `Error extracting PDF: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}