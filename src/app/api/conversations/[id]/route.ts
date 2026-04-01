//path: src\app\api\conversations\[id]\route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // In production, fetch from database
  return NextResponse.json({
    id: id,
    title: 'Mock Conversation',
    messages: [],
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // In production, delete from database
  return NextResponse.json({ success: true });
}