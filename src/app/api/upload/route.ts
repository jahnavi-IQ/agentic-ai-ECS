//path: src\app\api\upload\route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // In production, upload to S3
  // const s3Url = await uploadToS3(file);

  return NextResponse.json({
    id: Math.random().toString(36).substring(7),
    name: file.name,
    type: file.type,
    size: file.size,
    url: 'mock-url',
  });
}
