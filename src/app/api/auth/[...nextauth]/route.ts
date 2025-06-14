import { authOptions } from '@/lib/auth';
import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { addActivity } from '@/utils/database';
import { compare } from 'bcryptjs';
import { getUserByUsername, getUserById } from '@/utils/userUtils';
import path from 'path';
import fs from 'fs';
import admins from '@/data/helele.json';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 