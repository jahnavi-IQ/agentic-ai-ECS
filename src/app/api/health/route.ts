import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy' as const,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };

  return NextResponse.json(health, { status: 200 });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
