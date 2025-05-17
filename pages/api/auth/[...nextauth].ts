import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from '../../../lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email 
          },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
            isActive: true
          }
        });

        if (!user || !user.isActive) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        const role = user.role.toUpperCase() as 'ADMIN' | 'USER';

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: role,
          isActive: user.isActive
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: Number(token.id),
        email: token.email,
        name: token.name,
        role: token.role,
        isActive: token.isActive
      };
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  },
  debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(authOptions);
