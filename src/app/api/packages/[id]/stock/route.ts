import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src/data/packages.json');

async function loadPackages() {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

async function savePackages(packages: any) {
  await fs.writeFile(DATA_PATH, JSON.stringify(packages, null, 2), 'utf-8');
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Admin kontrolü eklenmeli
  try {
    const { durationLabel, stock, stockList } = await req.json();
    const { id } = params;
    const packages = await loadPackages();
    const pkg = packages.find((p: any) => p.id === id);
    if (!pkg) {
      return NextResponse.json({ error: 'Paket bulunamadı.' }, { status: 404 });
    }
    const duration = pkg.durations.find((d: any) => d.label === durationLabel);
    if (!duration) {
      return NextResponse.json({ error: 'Süre bulunamadı.' }, { status: 404 });
    }
    // Eğer stockList (string dizisi) gönderilmişse, duration'a stockList olarak kaydet.
    if (stockList) {
      duration.stockList = stockList;
    } else if (stock !== undefined) {
      // Eski (stock) alanı gönderilmişse, stock (sayı) olarak kaydet.
      duration.stock = stock;
    } else {
      return NextResponse.json({ error: 'Stok (stock) veya stok listesi (stockList) alanı bulunamadı.' }, { status: 400 });
    }
    await savePackages(packages);
    return NextResponse.json({ success: true, package: pkg });
  } catch (error) {
    return NextResponse.json({ error: 'Stok güncellenemedi.' }, { status: 500 });
  }
} 