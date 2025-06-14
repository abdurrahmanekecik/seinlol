import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, updateUser } from '@/utils/userUtils';
import { compare, hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await getUserById(session.user.id);
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Bu hesapta şifre değiştirilemez.' }, { status: 400 });
    }
    const { oldPassword, newPassword, newPasswordRepeat } = await req.json();
    if (!oldPassword || !newPassword || !newPasswordRepeat) {
      return NextResponse.json({ error: 'Tüm alanlar zorunlu.' }, { status: 400 });
    }
    if (newPassword !== newPasswordRepeat) {
      return NextResponse.json({ error: 'Yeni şifreler eşleşmiyor.' }, { status: 400 });
    }
    const isPasswordValid = await compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Eski şifre yanlış.' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalı.' }, { status: 400 });
    }
    const hashed = await hash(newPassword, 10);
    const updated = updateUser(user.id, { password: hashed });
    if (!updated) {
      return NextResponse.json({ error: 'Şifre güncellenemedi.' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
} 