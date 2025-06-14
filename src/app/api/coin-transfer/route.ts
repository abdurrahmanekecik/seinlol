import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, updateUser } from '@/utils/userUtils';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const TRANSFER_LOG_PATH = path.join(process.cwd(), 'src', 'data', 'transferLogs.json');

async function appendTransferLog(log: any) {
  let logs = [];
  try {
    const data = await fs.readFile(TRANSFER_LOG_PATH, 'utf-8');
    logs = JSON.parse(data);
  } catch (e) {
    // If file doesn't exist or is invalid, start with empty array
    logs = [];
  }
  logs.push(log);
  try {
    await fs.writeFile(TRANSFER_LOG_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing transfer log:', error);
    throw new Error('Failed to write transfer log');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
    }
    const fromUserId = session.user.id;
    const { toUserId, amount } = await request.json();
    if (!toUserId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
    }
    if (fromUserId === toUserId) {
      return NextResponse.json({ error: 'Kendinize transfer yapamazsınız.' }, { status: 400 });
    }
    // Kullanıcıları bul
    const fromUser = await getUserById(fromUserId);
    const toUser = await getUserById(toUserId);
    if (!fromUser || !toUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }
    if ((fromUser.coin || 0) < amount) {
      return NextResponse.json({ error: 'Yetersiz bakiye.' }, { status: 400 });
    }
    // Bakiyeleri güncelle
    const newFromBalance = (fromUser.coin || 0) - amount;
    const newToBalance = (toUser.coin || 0) + amount;
    const updatedFrom = await updateUser(fromUserId, { coin: newFromBalance });
    const updatedTo = await updateUser(toUserId, { coin: newToBalance });
    if (!updatedFrom || !updatedTo) {
      return NextResponse.json({ error: 'Transfer sırasında hata oluştu.' }, { status: 500 });
    }
    // Transfer logunu kaydet
    const log = {
      logId: uuidv4(),
      fromUserId,
      toUserId,
      amount,
      date: new Date().toISOString()
    };
    await appendTransferLog(log);
    return NextResponse.json({ success: true, fromUserId, toUserId, amount, newFromBalance, newToBalance });
  } catch (error) {
    console.error('Coin transfer error:', error);
    return NextResponse.json({ error: 'Transfer sırasında hata oluştu.' }, { status: 500 });
  }
} 