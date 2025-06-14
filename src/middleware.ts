import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request });

  // Sadece kullanıcı kaydı
  if (session?.sub) {
    try {
      await fetch(`${request.nextUrl.origin}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: session.sub,
          name: session.name,
          email: session.email,
          image: session.picture
        }),
      });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 