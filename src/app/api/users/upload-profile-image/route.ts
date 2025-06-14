import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Sadece JPG veya PNG dosyası yükleyebilirsiniz.' }, { status: 400 });
    }
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `${session.user.id}_${Date.now()}.${ext}`;
    const publicDir = path.join(process.cwd(), 'public', 'images', 'users');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    const filePath = path.join(publicDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    const url = `/images/users/${fileName}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Profil resmi yükleme hatası:', error);
    return NextResponse.json({ error: 'Yükleme sırasında bir hata oluştu.' }, { status: 500 });
  }
} 