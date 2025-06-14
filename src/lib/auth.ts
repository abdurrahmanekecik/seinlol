import { NextAuthOptions } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import admins from '@/data/helele.json';
import { addActivity } from '@/utils/database';
import { compare } from 'bcryptjs';
import { getUserByUsername, getUserById } from '@/utils/userUtils';
import path from 'path';
import fs from 'fs/promises';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Kullanıcı Adı/Şifre',
      credentials: {
        username: { label: 'Kullanıcı Adı', type: 'text', placeholder: 'kullaniciadi' },
        password: { label: 'Şifre', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        const user = await getUserByUsername(credentials.username);
        if (!user || !user.password) {
          return null;
        }
        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }
        // Aktivite kaydı ekle
        try {
          const avatarUrl = user.image || '/images/users/default.png';
          await addActivity({
            type: 'profile',
            user: {
              id: user.id,
              name: user.name || 'Anonim',
              avatar: avatarUrl
            },
            action: 'Giriş Yaptı'
          });
        } catch (error) {
          console.error('Error logging activity:', error);
        }
        return {
          id: user.id,
          name: user.name,
          image: user.image,
          role: user.role || 'Üye',
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile, user }: any) {
      if (account && profile) {
        token.id = profile.id;
        if (admins.adminIds.includes(profile.id)) {
          token.role = 'admin';
        } else {
          token.role = 'Üye';
        }
        token.createdAt = new Date().toISOString();
        token.lastLogin = new Date().toISOString();
        token.discordAvatar = profile.avatar;
        token.discriminator = profile.discriminator;
        const avatarUrl = profile.avatar 
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : '/images/users/default.png';
        try {
          await addActivity({
            type: 'profile',
            user: {
              id: profile.id,
              name: profile.username || profile.name || 'Anonim',
              avatar: avatarUrl
            },
            action: 'Giriş Yaptı'
          });
        } catch (error) {
          console.error('Error logging activity:', error);
        }
      } else if (user) {
        token.id = user.id;
        token.role = user.role;
        token.createdAt = user.createdAt;
        token.lastLogin = user.lastLogin;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.createdAt = token.createdAt;
        session.user.lastLogin = token.lastLogin;
        // Eğer adminIds içinde ise role 'admin' yap (ekstra güvenlik için)
        if (admins.adminIds.includes(token.id)) {
          session.user.role = 'admin';
        }
        // Her zaman güncel resmi oku
        await assignUserDataToSession(token, session);
      }
      return session;
    }
  },
  events: {
    async signOut({ token }: any) {
      try {
        // Kullanıcının en güncel avatarını veritabanından çek
        const user = await getUserById(token.id);
        const avatarUrl = user?.image || (token.discordAvatar 
          ? `https://cdn.discordapp.com/avatars/${token.id}/${token.discordAvatar}.png`
          : '/images/users/default.png');
        await addActivity({
          type: 'profile',
          user: {
            id: token.id,
            name: token.name || user?.name || 'Anonim',
            avatar: avatarUrl
          },
          action: 'Çıkış Yaptı'
        });
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    }
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};

// Refactored async user data assignment
async function assignUserDataToSession(token: any, session: any) {
  const userData = await getUserById(token.id);
  if (userData) {
    if (userData.image) {
      session.user.image = userData.image;
    } else {
      const defaultImagePath = path.join(process.cwd(), 'src', 'data', 'defaultProfileImage.json');
      try {
        let imageUrl = '/images/users/default.png';
        try {
          const jsonStr = await fs.readFile(defaultImagePath, 'utf-8');
          const json = JSON.parse(jsonStr);
          if (json.url) {
            imageUrl = json.url;
          }
        } catch (e) {
          // Dosya yoksa veya okunamazsa default bırak
        }
        session.user.image = imageUrl;
      } catch (error) {
        console.error('Error reading default profile image:', error);
        session.user.image = '/images/users/default.png';
      }
    }
    (session.user as any).coin = userData?.coin ?? 0;
  }
} 