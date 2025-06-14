import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TRANSFER_LOGS_PATH = path.join(process.cwd(), 'src', 'data', 'transferLogs.json');

// Ensure the file exists
if (!fs.existsSync(TRANSFER_LOGS_PATH)) {
  fs.writeFileSync(TRANSFER_LOGS_PATH, JSON.stringify([]), 'utf-8');
}

// GET: Fetch all transfer logs
export async function GET() {
  try {
    const data = fs.readFileSync(TRANSFER_LOGS_PATH, 'utf-8');
    const logs = JSON.parse(data);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load transfer logs' }, { status: 500 });
  }
}

// POST: Add a new transfer log
export async function POST(request: NextRequest) {
  try {
    const newLog = await request.json();
    const data = fs.readFileSync(TRANSFER_LOGS_PATH, 'utf-8');
    const logs = JSON.parse(data);
    logs.push(newLog);
    fs.writeFileSync(TRANSFER_LOGS_PATH, JSON.stringify(logs, null, 2), 'utf-8');
    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add transfer log' }, { status: 500 });
  }
} 