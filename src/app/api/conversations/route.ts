//path: src\app\api\conversations\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mockConversations } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  // In production, fetch from database
  return NextResponse.json(mockConversations);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newConversation = {
    id: Math.random().toString(36).substring(7),
    title: body.title || 'New Conversation',
    createdAt: new Date(),
    updatedAt: new Date(),
    messageCount: 0,
  };

  return NextResponse.json(newConversation, { status: 201 });
}