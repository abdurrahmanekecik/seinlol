import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const youtubeMediaFilePath = path.join(process.cwd(), 'src/data/youtubeMedia.json');

// Ensure data directory and file exist
const ensureFileExists = () => {
  const dataDir = path.join(process.cwd(), 'src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(youtubeMediaFilePath)) {
    fs.writeFileSync(youtubeMediaFilePath, JSON.stringify({ youtubeUrls: ['', ''] }, null, 2));
  }
};

ensureFileExists();

// Get YouTube video URLs
export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(youtubeMediaFilePath, 'utf-8'));
    // Ensure youtubeUrls is an array with at least two empty strings if file is empty or malformed
    const youtubeUrls = Array.isArray(data?.youtubeUrls) && data.youtubeUrls.length >= 2
      ? data.youtubeUrls.slice(0, 2)
      : ['', ''];
    return NextResponse.json({ youtubeUrls });
  } catch (error) {
    console.error('Error fetching YouTube media:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube media' }, { status: 500 });
  }
}

// Update YouTube video URLs
export async function PUT(request: Request) {
  try {
    const { youtubeUrls } = await request.json();

    // Basic validation: ensure it's an array of strings with length 2
    if (!Array.isArray(youtubeUrls) || youtubeUrls.length !== 2 || !youtubeUrls.every(url => typeof url === 'string')) {
      return NextResponse.json({ error: 'Invalid input: expected an array of two strings' }, { status: 400 });
    }

    const data = { youtubeUrls };
    fs.writeFileSync(youtubeMediaFilePath, JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating YouTube media:', error);
    return NextResponse.json({ error: 'Failed to update YouTube media' }, { status: 500 });
  }
} 