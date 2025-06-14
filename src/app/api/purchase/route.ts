import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const USERS_PATH = path.join(process.cwd(), 'src', 'data', 'users.json');
const PRODUCTS_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');
const PURCHASES_PATH = path.join(process.cwd(), 'src', 'data', 'purchases.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
}
function saveUsers(users: any) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
}
function loadProducts() {
  return JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
}
function saveProducts(products: any) {
  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf-8');
}
function loadPurchases() {
  if (!fs.existsSync(PURCHASES_PATH)) return [];
  return JSON.parse(fs.readFileSync(PURCHASES_PATH, 'utf-8'));
}
function savePurchases(purchases: any) {
  fs.writeFileSync(PURCHASES_PATH, JSON.stringify(purchases, null, 2), 'utf-8');
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get the product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create the purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        amount: product.slcAmount,
        price: product.price,
        currency: product.currency,
        status: 'pending'
      }
    });

    // Update user's coin balance and role
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        coin: {
          increment: product.slcAmount
        },
        role: 'customer'
      }
    });

    // Update purchase status to completed
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'completed' }
    });

    return NextResponse.json({
      success: true,
      purchase,
      message: 'Purchase completed successfully',
      roleUpdated: true
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 