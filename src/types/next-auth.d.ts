import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      createdAt: string;
      lastLogin: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }

  interface Profile {
    id: string;
    username: string;
    avatar: string;
    email?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    createdAt: string;
    lastLogin: string;
  }
} 