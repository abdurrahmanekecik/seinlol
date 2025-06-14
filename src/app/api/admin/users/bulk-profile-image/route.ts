import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsers, saveUsers, getUserById } from '@/utils/userUtils';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const adminUser = await getUserById(session.user.id);
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'owner')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }
    // URL geçerliliği kontrolü
    try { new URL(imageUrl); } catch { return NextResponse.json({ error: 'Geçersiz URL' }, { status: 400 }); }

    const users = getUsers();
    let updated = 0;
    for (const user of users) {
      if (!user.email) {
        user.image = imageUrl;
        updated++;
      }
    }
    saveUsers(users);
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Toplu profil resmi güncelleme hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

