import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const presenceDataPath = path.join(process.cwd(), 'data', 'discord-presence.json');

// Veri dosyasını oluştur (eğer yoksa)
function ensureDataFile() {
  const dataDir = path.dirname(presenceDataPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(presenceDataPath)) {
    fs.writeFileSync(presenceDataPath, JSON.stringify({}, null, 2));
  }
}

// POST: Discord botundan presence verilerini al
export async function POST(request: NextRequest) {
  try {
    console.log('Discord presence POST isteği alındı');
    ensureDataFile();
    
    const presenceData = await request.json();
    console.log('Gelen presence verileri:', Object.keys(presenceData));
    
    // Mevcut veriyi oku
    let currentData = {};
    try {
      const existingData = fs.readFileSync(presenceDataPath, 'utf8');
      currentData = JSON.parse(existingData);
    } catch (error) {
      console.error('Mevcut veri okuma hatası:', error);
    }
    
    // Yeni veriyi güncelle
    const updatedData = { ...currentData, ...presenceData };
    
    // Veriyi kaydet
    fs.writeFileSync(presenceDataPath, JSON.stringify(updatedData, null, 2));
    
    console.log('Discord presence verileri güncellendi:', Object.keys(presenceData));
    
    return NextResponse.json({ success: true, updated: Object.keys(presenceData) });
    
  } catch (error) {
    console.error('Discord presence API hatası:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Presence verilerini döndür
export async function GET() {
  try {
    if (!fs.existsSync(presenceDataPath)) {
      return NextResponse.json({});
    }
    const data = fs.readFileSync(presenceDataPath, 'utf8');
    const presenceData = JSON.parse(data);
    return NextResponse.json(presenceData);
  } catch (error) {
    return NextResponse.json({ error: 'Presence verisi okunamadı.' }, { status: 500 });
  }
} 