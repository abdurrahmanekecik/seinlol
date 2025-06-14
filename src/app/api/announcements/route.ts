import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Announcement } from '@/utils/database';

const ANNOUNCEMENTS_PATH = path.join(process.cwd(), 'src', 'data', 'announcements.json');

// Ensure the file exists
if (!fs.existsSync(ANNOUNCEMENTS_PATH)) {
  fs.writeFileSync(ANNOUNCEMENTS_PATH, JSON.stringify({ announcements: [] }), 'utf-8');
}

// GET: Fetch all announcements
export async function GET() {
  try {
    const data = fs.readFileSync(ANNOUNCEMENTS_PATH, 'utf-8');
    const announcements = JSON.parse(data);
    return NextResponse.json(announcements.announcements || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load announcements' }, { status: 500 });
  }
}

// POST: Add a new announcement
export async function POST(request: NextRequest) {
  try {
    const newAnnouncement = await request.json();
    const data = fs.readFileSync(ANNOUNCEMENTS_PATH, 'utf-8');
    const announcements = JSON.parse(data);
    announcements.push(newAnnouncement);
    fs.writeFileSync(ANNOUNCEMENTS_PATH, JSON.stringify(announcements, null, 2), 'utf-8');
    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add announcement' }, { status: 500 });
  }
}

// Duyuru güncelle
export async function PUT(request: Request) {
  try {
    const data = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_PATH, 'utf-8'));
    const updatedAnnouncementData = await request.json();

    const index = data.announcements.findIndex((a: Announcement) => a.id === updatedAnnouncementData.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Duyuru bulunamadı' }, { status: 404 });
    }

    const updatedAnnouncement: Announcement = {
      ...data.announcements[index],
      title: updatedAnnouncementData.title,
      description: updatedAnnouncementData.description,
      isImportant: updatedAnnouncementData.isImportant,
      adminId: updatedAnnouncementData.adminId,
      adminName: updatedAnnouncementData.adminName,
      adminImage: updatedAnnouncementData.adminImage,
      updatedAt: new Date().toISOString()
    };

    data.announcements[index] = updatedAnnouncement;
    fs.writeFileSync(ANNOUNCEMENTS_PATH, JSON.stringify(data, null, 2));
    
    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: 'Duyuru güncellenirken hata oluştu' }, { status: 500 });
  }
}

// Duyuru sil
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const data = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_PATH, 'utf-8'));
    
    data.announcements = data.announcements.filter((a: Announcement) => a.id !== id);
    fs.writeFileSync(ANNOUNCEMENTS_PATH, JSON.stringify(data, null, 2));

    return NextResponse.json({ message: 'Duyuru başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Duyuru silinirken hata oluştu' }, { status: 500 });
  }
} 