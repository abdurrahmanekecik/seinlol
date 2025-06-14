import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const guidesFilePath = path.join(process.cwd(), 'data', 'guides.json');

// Kılavuz verilerini oku
async function readGuides() {
  try {
    const data = await fs.readFile(guidesFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Dosya yoksa boş array döndür
    return [];
  }
}

// Kılavuz verilerini yaz
async function writeGuides(guides: any[]) {
  await fs.writeFile(guidesFilePath, JSON.stringify(guides, null, 2));
}

// GET - Tüm kılavuzları getir
export async function GET() {
  try {
    const guides = await readGuides();
    return NextResponse.json(guides);
  } catch (error) {
    return NextResponse.json({ error: 'Kılavuzlar yüklenemedi' }, { status: 500 });
  }
}

// POST - Yeni kılavuz ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId, packageName, title, description, link } = body;

    if (!packageId || !packageName || !title || !link) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    const guides = await readGuides();
    const newGuide = {
      id: Date.now().toString(),
      packageId,
      packageName,
      title,
      description: description || '',
      link,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    guides.push(newGuide);
    await writeGuides(guides);

    return NextResponse.json(newGuide);
  } catch (error) {
    return NextResponse.json({ error: 'Kılavuz eklenemedi' }, { status: 500 });
  }
}

// PUT - Kılavuz güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, link } = body;

    if (!id) {
      return NextResponse.json({ error: 'Kılavuz ID gerekli' }, { status: 400 });
    }

    const guides = await readGuides();
    const guideIndex = guides.findIndex((g: any) => g.id === id);

    if (guideIndex === -1) {
      return NextResponse.json({ error: 'Kılavuz bulunamadı' }, { status: 404 });
    }

    guides[guideIndex] = {
      ...guides[guideIndex],
      title: title || guides[guideIndex].title,
      description: description || guides[guideIndex].description,
      link: link || guides[guideIndex].link,
      updatedAt: new Date().toISOString()
    };

    await writeGuides(guides);
    return NextResponse.json(guides[guideIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Kılavuz güncellenemedi' }, { status: 500 });
  }
}

// DELETE - Kılavuz sil
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Kılavuz ID gerekli' }, { status: 400 });
    }

    const guides = await readGuides();
    const filteredGuides = guides.filter((g: any) => g.id !== id);

    if (filteredGuides.length === guides.length) {
      return NextResponse.json({ error: 'Kılavuz bulunamadı' }, { status: 404 });
    }

    await writeGuides(filteredGuides);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Kılavuz silinemedi' }, { status: 500 });
  }
} 