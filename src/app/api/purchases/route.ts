import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define types for purchases
interface Purchase {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  productId: number;
  productName: string;
  amount: number;
  price: number;
  currency: string;
  purchaseDate: string;
  status: 'completed' | 'pending' | 'failed';
}

// Configuration
const DISCORD_BOT_API_URL = process.env.DISCORD_BOT_API_URL || 'http://localhost:80';

// Sample products
const products = [
  { id: 1, name: '10 SLC', slcAmount: 10, price: 1, currency: '$' },
  { id: 2, name: '50 SLC', slcAmount: 50, price: 5, currency: '$' },
  { id: 3, name: '100 SLC', slcAmount: 100, price: 10, currency: '$' },
  { id: 4, name: '500 SLC', slcAmount: 500, price: 50, currency: '$' },
  { id: 5, name: '1000 SLC', slcAmount: 1000, price: 100, currency: '$' },
];

// File path for purchases
const purchasesPath = path.join(process.cwd(), 'src', 'data', 'purchases.json');
const coinPurchasesPath = path.join(process.cwd(), 'src', 'data', 'coinPurchases.json');

const PACKAGES_PATH = path.join(process.cwd(), 'src/data/packages.json');
const USERS_PATH = path.join(process.cwd(), 'src/data/users.json');
const PURCHASES_PATH = path.join(process.cwd(), 'src/data/userPurchases.json');

async function loadPackages() {
  const data = await fs.readFile(PACKAGES_PATH, 'utf-8');
  return JSON.parse(data);
}
async function savePackages(packages: any) {
  await fs.writeFile(PACKAGES_PATH, JSON.stringify(packages, null, 2), 'utf-8');
}
async function loadUsers() {
  const data = await fs.readFile(USERS_PATH, 'utf-8');
  return JSON.parse(data);
}
async function saveUsers(users: any) {
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
}
async function loadPurchases() {
  const data = await fs.readFile(PURCHASES_PATH, 'utf-8');
  return JSON.parse(data);
}
async function savePurchases(purchases: any) {
  await fs.writeFile(PURCHASES_PATH, JSON.stringify(purchases, null, 2), 'utf-8');
}

// Load coin purchases
async function loadCoinPurchases() {
  try {
    const data = await fs.readFile(coinPurchasesPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Save coin purchases
async function saveCoinPurchases(purchases: any) {
  await fs.writeFile(coinPurchasesPath, JSON.stringify(purchases, null, 2), 'utf-8');
}

// Helper function to notify Discord bot about purchase
async function notifyDiscordBot(purchase: Purchase): Promise<boolean> {
  try {
    const response = await fetch(`${DISCORD_BOT_API_URL}/notify/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: purchase.userId,
        userName: purchase.userName,
        productName: purchase.productName,
        amount: purchase.amount,
        price: purchase.price,
        currency: purchase.currency,
        purchaseDate: purchase.purchaseDate
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Discord bot notification failed:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('Discord bot notification sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error notifying Discord bot:', error);
    return false;
  }
}

// GET handler to fetch all purchases (both package and coin purchases)
export async function GET() {
  try {
    const [packagePurchases, coinPurchases, usersRaw] = await Promise.all([
      loadPurchases(),
      loadCoinPurchases(),
      loadUsers()
    ]);
    const users = Array.isArray(usersRaw) ? usersRaw : usersRaw.users;

    // Combine and format all purchases
    const allPurchases = [];

    // Add package purchases
    for (const purchase of packagePurchases) {
      const user = users.find((u: any) => u.id === purchase.userId);
      if (user) {
        allPurchases.push({
          id: purchase.id,
          userId: purchase.userId,
          userName: user.name,
          userImage: user.image,
          productId: purchase.packageId,
          productName: purchase.packageName,
          licenseCode: purchase.stock || 'N/A',
          purchaseDate: purchase.purchaseDate,
          status: 'completed'
        });
      }
    }

    // Add coin purchases
    for (const purchase of coinPurchases) {
      const user = users.find((u: any) => u.id === purchase.userId);
      if (user) {
        allPurchases.push({
          id: purchase.id,
          userId: purchase.userId,
          userName: user.name,
          userImage: user.image,
          productId: purchase.productId,
          productName: purchase.productName,
          amount: purchase.amount,
          price: purchase.price,
          currency: purchase.currency,
          purchaseDate: purchase.purchaseDate,
          status: purchase.status || 'completed'
        });
      }
    }

    // Sort by purchase date (newest first)
    allPurchases.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    return NextResponse.json(allPurchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Satın alım geçmişi yüklenirken hata oluştu.' }, { status: 500 });
  }
}

// POST handler to create a new purchase
export async function POST(req: NextRequest) {
  try {
    const { userId, packageId, durationLabel } = await req.json();
    if (!userId || !packageId || !durationLabel) {
      return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
    }
    const [users, packages, purchases] = await Promise.all([
      loadUsers(),
      loadPackages(),
      loadPurchases()
    ]);
    const user = users.find((u: any) => u.id === userId);
    if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    const pkg = packages.find((p: any) => p.id === packageId);
    if (!pkg) return NextResponse.json({ error: 'Paket bulunamadı.' }, { status: 404 });
    const duration = pkg.durations.find((d: any) => d.label === durationLabel);
    if (!duration) return NextResponse.json({ error: 'Süre bulunamadı.' }, { status: 404 });
    if (duration.stock <= 0) return NextResponse.json({ error: 'Stok yok.' }, { status: 400 });
    if (user.coin < duration.coinPrice) return NextResponse.json({ error: 'Yetersiz coin.' }, { status: 400 });
    // Coin ve stok düş
    user.coin -= duration.coinPrice;
    duration.stock -= 1;
    // Kullanıcı rolünü customer yap
    if (user.role !== 'customer') {
      user.role = 'customer';
    }
    // Satın alma kaydı oluştur
    const now = new Date();
    const expire = new Date(now.getTime() + duration.days * 24 * 60 * 60 * 1000);
    const purchase = {
      userId,
      packageId,
      durationLabel,
      purchaseDate: now.toISOString(),
      expireDate: expire.toISOString(),
      packageSnapshot: {
        name: pkg.name,
        image: pkg.image,
        description: pkg.description,
        features: pkg.features,
        duration: duration.label
      }
    };
    purchases.push(purchase);
    await Promise.all([
      saveUsers(users),
      savePackages(packages),
      savePurchases(purchases)
    ]);
    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    return NextResponse.json({ error: 'Satın alma işlemi başarısız.' }, { status: 500 });
  }
} 