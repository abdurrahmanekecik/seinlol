import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import admins from '@/data/helele.json';
import { updateUserApplicationStatus } from '@/lib/userUtils';

const USERS_PATH = path.join(process.cwd(), 'src', 'data', 'users.json');
const adminsFilePath = path.join(process.cwd(), 'src/data/helele.json');

// Ensure the file exists
if (!fs.existsSync(USERS_PATH)) {
  fs.writeFileSync(USERS_PATH, JSON.stringify({ users: [] }), 'utf-8');
}

// Kullanıcıları kaydet
async function saveUser(userData: any) {
  try {
    const data = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    
    // Kullanıcı zaten var mı kontrol et
    const existingUser = data.users.find((user: any) => user.id === userData.id);
    if (!existingUser) {
      data.users.push({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        image: userData.image,
        createdAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: "member",
        applicationStatus: null,
        rejectionCount: 0,
        isBanned: false
      });
      fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2));
    } else {
      // Sadece son giriş tarihini güncelle
      existingUser.lastLogin = new Date().toISOString();
      fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2));
    }
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
}

// GET: Fetch all users
export async function GET() {
  try {
    const data = fs.readFileSync(USERS_PATH, 'utf-8');
    const users = JSON.parse(data);
    return NextResponse.json(users.users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

// POST: Add a new user
export async function POST(request: NextRequest) {
  try {
    const newUser = await request.json();
    const data = fs.readFileSync(USERS_PATH, 'utf-8');
    const users = JSON.parse(data);
    users.push(newUser);
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
  }
}

// Kullanıcı durumunu güncelle
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Yetki kontrolü
    if (!session?.user?.id || !admins.adminIds.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, isAdmin, role, isBanned } = await request.json();

    // admins.json dosyasını oku
    const adminData = JSON.parse(fs.readFileSync(adminsFilePath, 'utf-8'));

    // users.json dosyasını oku
    const userData = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    const userToUpdate = userData.users.find((user: any) => user.id === userId);

    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (isAdmin !== undefined) {
    if (isAdmin) {
      // Admin yap
      if (!adminData.adminIds.includes(userId)) {
        adminData.adminIds.push(userId);
      }
    } else {
      // Admin yetkisini al
      adminData.adminIds = adminData.adminIds.filter((id: string) => id !== userId);
      }
    }

    if (role !== undefined) {
      // Rolü güncelle
      const validRoles = ["customer", "owner", "developer", "staff"]; // Define valid roles
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
      }
      userToUpdate.role = role;
    }

    if (isBanned !== undefined) {
      userToUpdate.isBanned = isBanned;
    }

    // Değişiklikleri kaydet
    fs.writeFileSync(adminsFilePath, JSON.stringify(adminData, null, 2));

    // Kullanıcı verisini kaydet
    fs.writeFileSync(USERS_PATH, JSON.stringify(userData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Kullanıcı silme
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !admins.adminIds.includes(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = await request.json();
    const userData = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    const beforeCount = userData.users.length;
    userData.users = userData.users.filter((user: any) => user.id !== userId);
    fs.writeFileSync(USERS_PATH, JSON.stringify(userData, null, 2));
    if (userData.users.length === beforeCount) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 