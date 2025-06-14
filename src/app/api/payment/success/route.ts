import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, updateUser } from '@/utils/userUtils';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, productId } = await req.json();
    if (!amount || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Kullanıcıyı bul
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mevcut coin bakiyesini al
    const currentBalance = user.coin || 0;

    // Yeni bakiyeyi hesapla (amount kadar artır)
    const newBalance = currentBalance + amount;

    // Kullanıcıyı güncelle - coin bakiyesi ve Customer rolü
    const updatedUser = updateUser(user.id, { 
      coin: newBalance,
      role: 'customer' // Ödeme başarılı olduğunda Customer rolü ver
    });
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    // Satın alma kaydını oluştur
    const purchase = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name || 'Unknown',
      userImage: user.image || '/images/users/default.png',
      amount,
      price: amount / 10, // 1 SLC = $0.1
      currency: '$',
      purchaseDate: new Date().toISOString(),
      status: 'completed' as const
    };

    // coinPurchases.json'a kaydet
    const coinPurchasesPath = path.join(process.cwd(), 'src', 'data', 'coinPurchases.json');
    let coinPurchases: any[] = [];
    try {
      const file = await fsPromises.readFile(coinPurchasesPath, 'utf-8');
      coinPurchases = JSON.parse(file);
    } catch (e) {
      coinPurchases = [];
    }
    coinPurchases.push(purchase);
    await fsPromises.writeFile(coinPurchasesPath, JSON.stringify(coinPurchases, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      newBalance,
      purchase,
      roleUpdated: true
    });
  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 