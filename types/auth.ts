import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      role: 'ADMIN' | 'USER';
      name: string;
      email: string;
      isActive: boolean;
    }
  }
}
