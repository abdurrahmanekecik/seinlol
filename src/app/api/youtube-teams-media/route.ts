import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const YOUTUBE_TEAMS_MEDIA_PATH = path.join(process.cwd(), 'src', 'data', 'youtubeTeamsVideo.json');

// Ensure the file exists
if (!fs.existsSync(YOUTUBE_TEAMS_MEDIA_PATH)) {
  fs.writeFileSync(YOUTUBE_TEAMS_MEDIA_PATH, JSON.stringify({ youtubeUrl: '' }), 'utf-8');
}

// GET: Fetch YouTube teams media
export async function GET() {
  try {
    const data = fs.readFileSync(YOUTUBE_TEAMS_MEDIA_PATH, 'utf-8');
    const media = JSON.parse(data);
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load YouTube teams media' }, { status: 500 });
  }
}

// POST: Add a new YouTube teams media
export async function POST(request: NextRequest) {
  try {
    const newMedia = await request.json();
    const data = fs.readFileSync(YOUTUBE_TEAMS_MEDIA_PATH, 'utf-8');
    const media = JSON.parse(data);
    media.youtubeUrl = newMedia.youtubeUrl;
    fs.writeFileSync(YOUTUBE_TEAMS_MEDIA_PATH, JSON.stringify(media, null, 2), 'utf-8');
    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add YouTube teams media' }, { status: 500 });
  }
} 