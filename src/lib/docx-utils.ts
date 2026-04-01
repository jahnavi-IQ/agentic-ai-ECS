//Path: src\lib\docx-utils.ts
export async function extractDocxText(base64Content: string): Promise<string> {
  try {
    // Dynamic import for mammoth
    const mammoth = await import('mammoth');
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, 'base64');
    
    console.log('📄 Extracting text from Word document with mammoth...');
    console.log('Buffer size:', buffer.length, 'bytes');
    
    // Extract plain text from .docx
    const result = await mammoth.extractRawText({ buffer });
    
    console.log('✅ Word document parsed successfully');
    console.log('Text length:', result.value?.length || 0, 'characters');
    console.log('Messages:', result.messages);
    
    if (!result.value || result.value.trim().length === 0) {
      return 'Word document appears to be empty or could not be parsed.';
    }
    
    return result.value;
  } catch (error) {
    console.error('❌ Word document extraction error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return `Error extracting Word document: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}