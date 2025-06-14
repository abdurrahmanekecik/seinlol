import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ACTIVITIES_PATH = path.join(process.cwd(), 'data', 'activities.json');

// Ensure the file exists
if (!fs.existsSync(ACTIVITIES_PATH)) {
  fs.writeFileSync(ACTIVITIES_PATH, JSON.stringify({ activities: [] }), 'utf-8');
}

// GET: Fetch all activities
export async function GET() {
  try {
    const data = fs.readFileSync(ACTIVITIES_PATH, 'utf-8');
    const activities = JSON.parse(data);
    return NextResponse.json(activities.activities || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load activities' }, { status: 500 });
  }
}

// POST: Add a new activity
export async function POST(request: NextRequest) {
  try {
    const newActivity = await request.json();
    const data = fs.readFileSync(ACTIVITIES_PATH, 'utf-8');
    const activities = JSON.parse(data);
    activities.push(newActivity);
    fs.writeFileSync(ACTIVITIES_PATH, JSON.stringify(activities, null, 2), 'utf-8');
    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add activity' }, { status: 500 });
  }
} 