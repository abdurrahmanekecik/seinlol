import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TRANSFER_LOG_PATH = path.join(process.cwd(), 'src', 'data', 'transferLogs.json');

// Ensure the file exists
async function ensureFileExists() {
  try {
    await fs.access(TRANSFER_LOG_PATH);
  } catch {
    await fs.writeFile(TRANSFER_LOG_PATH, JSON.stringify([]), 'utf-8');
  }
}

export async function GET() {
  try {
    await ensureFileExists();
    const data = await fs.readFile(TRANSFER_LOG_PATH, 'utf-8');
    const logs = JSON.parse(data);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error reading transfer logs:', error);
    return NextResponse.json([], { status: 200 });
  }
} 