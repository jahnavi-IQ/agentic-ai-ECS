//path: src\app\api\test\route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasBedrockKey: !!process.env.BEDROCK_ACCESS_KEY_ID,
    hasBedrockSecret: !!process.env.BEDROCK_SECRET_ACCESS_KEY,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    region: process.env.BEDROCK_REGION,
    bedrockKeyPreview: process.env.BEDROCK_ACCESS_KEY_ID 
      ? process.env.BEDROCK_ACCESS_KEY_ID.slice(0, 4) + '...' + process.env.BEDROCK_ACCESS_KEY_ID.slice(-4)
      : 'MISSING',
  });
}