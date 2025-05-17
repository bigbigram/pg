import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      email: string;
      name: string;
      role: 'ADMIN' | 'USER';
      isActive: boolean;
    }
  }

  interface User {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
    isActive: boolean;
  }
}
