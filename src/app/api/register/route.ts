import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByUsername } from '@/utils/userUtils';
import { addActivity } from '@/utils/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Veri doğrulama
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre alanları zorunludur.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Kullanıcı adı kontrolü
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor.' },
        { status: 400 }
      );
    }

    // Kullanıcı oluştur
    const newUser = await createUser({ username, password });
    if (!newUser) {
      return NextResponse.json(
        { error: 'Kullanıcı oluşturulurken bir hata oluştu.' },
        { status: 500 }
      );
    }

    // Aktivite kaydı ekle
    try {
      await addActivity({
        type: 'profile',
        user: {
          id: newUser.id,
          name: newUser.name || 'Anonim',
          avatar: newUser.image || '/images/users/default.png'
        },
        action: 'Kayıt Oldu'
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }

    // Hassas bilgileri kaldırılmış kullanıcı nesnesi döndür
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(
      { message: 'Kullanıcı başarıyla oluşturuldu.', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
