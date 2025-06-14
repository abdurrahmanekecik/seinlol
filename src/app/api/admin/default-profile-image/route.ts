import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    // Sadece jpg ve png kabul et
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Sadece JPG veya PNG dosyası yükleyebilirsiniz.' }, { status: 400 });
    }

    // Dosya adını belirle
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `default.${ext}`;
    const publicDir = path.join(process.cwd(), 'public', 'images', 'users');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    const filePath = path.join(publicDir, fileName);

    // Dosyayı kaydet
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // JSON dosyasını güncelle
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'defaultProfileImage.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ url: `/images/users/${fileName}` }, null, 2));

    return NextResponse.json({ success: true, url: `/images/users/${fileName}` });
  } catch (error) {
    console.error('Profil resmi yükleme hatası:', error);
    return NextResponse.json({ error: 'Yükleme sırasında bir hata oluştu.' }, { status: 500 });
  }
} 