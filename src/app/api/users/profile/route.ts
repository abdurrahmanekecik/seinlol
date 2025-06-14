import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById } from '@/utils/userUtils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('GET /api/users/profile çağrıldı');
    
    const session = await getServerSession(authOptions);
      /*   console.log('Session bilgileri:', {
      sessionExists: !!session,
      userExists: !!session?.user,
      userId: session?.user?.id || 'YOK',
      userName: session?.user?.name || 'YOK'
    });*/
    
    if (!session?.user?.id) {
    //  console.error('Oturum bulunamadı veya user ID yok');
      return NextResponse.json({ error: 'Unauthorized', sessionInfo: 'No user ID found' }, { status: 401 });
    }
    
    // Kullanıcı verilerini userUtils ile getir
    //console.log(`getUserById çağrılıyor: ${session.user.id}`);
    const user = await getUserById(session.user.id);
    
    if (!user) {
      //console.error(`Kullanıcı bulunamadı: ${session.user.id}`);
      return NextResponse.json({ error: 'User not found', userId: session.user.id }, { status: 404 });
    }
    
    //console.log('Kullanıcı bulundu, yanıt döndürülüyor:', { name: user.name, email: user.email });
    
    // Hassas bilgileri kaldır
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
   // console.error('Error fetching user profile:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
