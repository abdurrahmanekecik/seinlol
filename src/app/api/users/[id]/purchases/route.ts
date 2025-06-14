import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PURCHASES_PATH = path.join(process.cwd(), 'src/data/userPurchases.json');
const USERS_PATH = path.join(process.cwd(), 'src/data/users.json');
const PACKAGES_PATH = path.join(process.cwd(), 'src/data/packages.json');

async function loadPurchases() {
  const data = await fs.readFile(PURCHASES_PATH, 'utf-8');
  return JSON.parse(data);
}

async function loadUsers() {
  const data = await fs.readFile(USERS_PATH, 'utf-8');
  return JSON.parse(data);
}

async function saveUsers(users: any) {
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

async function loadPackagesData() {
  const data = await fs.readFile(PACKAGES_PATH, 'utf-8');
  return JSON.parse(data);
}

async function savePackagesData(packages: any) {
  await fs.writeFile(PACKAGES_PATH, JSON.stringify(packages, null, 2), 'utf-8');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const purchases = await loadPurchases();
    const userPurchases = purchases.filter((p: any) => p.userId === id);
    return NextResponse.json(userPurchases);
  } catch (error) {
    return NextResponse.json({ error: 'Satın alınan paketler yüklenemedi.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { packageId, durationLabel } = await req.json();
    const userId = params.id;
    const usersData = await loadUsers();
    const user = usersData.users.find((u: any) => u.id === userId);
    if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    const packages = await loadPackagesData();
    const pkg = packages.find((p: any) => p.id === packageId);
    if (!pkg) return NextResponse.json({ error: 'Paket bulunamadı.' }, { status: 404 });
    // duration eşleşmesini küçük/büyük harf duyarsız ve trim'li yap
    const normalize = (str: string) => str?.toLocaleLowerCase('tr-TR').trim();
    const duration = pkg.durations.find((d: any) => normalize(d.label) === normalize(durationLabel));
    if (!duration) return NextResponse.json({ error: 'Süre bulunamadı.' }, { status: 404 });
    if (!duration.stockList || duration.stockList.length === 0) return NextResponse.json({ error: 'Stok yok.' }, { status: 400 });
    if (user.coin < duration.coinPrice) return NextResponse.json({ error: 'Yetersiz bakiye.' }, { status: 400 });
    // Stoktan bir ürün çek
    const stockToGive = duration.stockList.shift();
    // Coin düş
    user.coin -= duration.coinPrice;
    // Kullanıcı rolünü customer yap
    if (user.role !== 'customer') {
      user.role = 'customer';
    }
    // Satın alımı userPurchases.json'a ekle
    const purchases = JSON.parse(await fs.readFile(PURCHASES_PATH, 'utf-8'));
    const newPurchase = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      packageId,
      packageName: pkg.name,
      durationLabel,
      coinPrice: duration.coinPrice,
      stock: stockToGive,
      purchaseDate: new Date().toISOString(),
      expireDate: new Date(Date.now() + (duration.days || 1) * 24 * 60 * 60 * 1000).toISOString(),
    };
    purchases.push(newPurchase);
    await fs.writeFile(PURCHASES_PATH, JSON.stringify(purchases, null, 2), 'utf-8');
    // Güncellenen users ve packages dosyalarını kaydet
    await saveUsers(usersData);
    await savePackagesData(packages);
    return NextResponse.json({ success: true, purchase: newPurchase });
  } catch (error) {
    return NextResponse.json({ error: 'Satın alma işlemi başarısız.' }, { status: 500 });
  }
} 