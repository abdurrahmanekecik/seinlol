import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const PACKAGES_PATH = path.join(process.cwd(), 'src', 'data', 'packages.json');

// Ensure the file exists
if (!fs.existsSync(PACKAGES_PATH)) {
  fs.writeFileSync(PACKAGES_PATH, JSON.stringify([]), 'utf-8');
}

// GET: Fetch all packages
export async function GET() {
  try {
    const data = fs.readFileSync(PACKAGES_PATH, 'utf-8');
    const packages = JSON.parse(data);
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load packages' }, { status: 500 });
  }
}

// POST: Add a new package
export async function POST(request: NextRequest) {
  try {
    const newPackage = await request.json();
    const data = fs.readFileSync(PACKAGES_PATH, 'utf-8');
    const packages = JSON.parse(data);
    
    // Eğer id yoksa veya boşsa, yeni bir id oluştur
    if (!newPackage.id) {
      newPackage.id = Date.now().toString();
    }
    
    packages.push(newPackage);
    fs.writeFileSync(PACKAGES_PATH, JSON.stringify(packages, null, 2), 'utf-8');
    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add package' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = fs.readFileSync(PACKAGES_PATH, 'utf-8');
  const packages = JSON.parse(data);
  const idx = packages.findIndex((p: any) => p.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  packages[idx] = { ...packages[idx], ...body };
  fs.writeFileSync(PACKAGES_PATH, JSON.stringify(packages, null, 2), 'utf-8');
  return NextResponse.json({ success: true, package: packages[idx] });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const data = fs.readFileSync(PACKAGES_PATH, 'utf-8');
  let packages = JSON.parse(data);
  const idx = packages.findIndex((p: any) => p.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  const deleted = packages[idx];
  packages = packages.filter((p: any) => p.id !== body.id);
  fs.writeFileSync(PACKAGES_PATH, JSON.stringify(packages, null, 2), 'utf-8');
  return NextResponse.json({ success: true, deleted });
} 