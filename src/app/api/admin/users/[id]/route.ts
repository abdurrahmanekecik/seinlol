import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUsers, saveUsers, getUserById } from '@/utils/userUtils';
import fs from 'fs';
import path from 'path';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const adminUser = await getUserById(session.user.id);
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'owner')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const userId = params.id;
    // Kullanıcıyı users.json'dan sil
    let users = getUsers();
    const beforeCount = users.length;
    users = users.filter(u => u.id !== userId);
    saveUsers(users);
    // Lisans kodları, aktiviteler gibi ilişkili diğer veriler varsa onları da sil
    // Örnek: Lisans kodları
    const licensePath = path.join(process.cwd(), 'src', 'data', 'licenseCodes.json');
    if (fs.existsSync(licensePath)) {
      const licenseData = JSON.parse(fs.readFileSync(licensePath, 'utf-8'));
      if (Array.isArray(licenseData)) {
        const updated = licenseData.filter((l: any) => l.assignedToUserId !== userId);
        fs.writeFileSync(licensePath, JSON.stringify(updated, null, 2));
      } else if (Array.isArray(licenseData.licenseCodes)) {
        licenseData.licenseCodes = licenseData.licenseCodes.filter((l: any) => l.assignedToUserId !== userId);
        fs.writeFileSync(licensePath, JSON.stringify(licenseData, null, 2));
      }
    }
    // Diğer ilişkili veriler için de benzer şekilde silme işlemi eklenebilir
    if (beforeCount === users.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kullanıcı silinirken hata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 