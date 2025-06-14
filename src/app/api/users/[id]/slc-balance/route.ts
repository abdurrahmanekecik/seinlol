import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, updateUser } from '@/utils/userUtils';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sadece admin kullanıcılar coin ekleyip çıkarabilir
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update coin balance' }, { status: 403 });
    }

    const userId = params.id;
    const { amount } = await request.json();

    if (typeof amount !== 'number') {
      return NextResponse.json({ error: 'Amount must be a number' }, { status: 400 });
    }

    // Kullanıcıyı bul
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mevcut coin bakiyesini al
    const currentBalance = user.coin || 0;

    // Yeni bakiyeyi hesapla
    const newBalance = currentBalance + amount;

    // 0'dan küçük olmasını engelle
    if (newBalance < 0) {
      return NextResponse.json({ error: 'Balance cannot be negative' }, { status: 400 });
    }

    // Kullanıcıyı güncelle
    const updatedUser = await updateUser(userId, { coin: newBalance });
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      userId,
      oldBalance: currentBalance,
      newBalance,
      change: amount
    });

  } catch (error) {
    console.error('Error updating user balance:', error);
    return NextResponse.json({ 
      error: 'Failed to update balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 