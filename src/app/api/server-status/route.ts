import { NextResponse } from 'next/server';

export async function GET() {
  const serverStatus = {
    isOnline: false,
    playerCount: 0,
    lastUpdated: new Date().toISOString()
  };

  return NextResponse.json(serverStatus);
} 