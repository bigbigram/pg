import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  password?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test database connection by fetching users
    const users = await prisma.user.findMany();
    
    // Check if there are any users
    if (users.length === 0) {
      return res.status(200).json({ 
        message: 'Database connection successful but no users found',
        users: []
      });
    }

    // Return the list of users (without passwords)
    const usersWithoutPasswords = users.map(({ password, ...user }) => user as Omit<User, 'password'>);
    return res.status(200).json({ 
      message: 'Database connection successful',
      users: usersWithoutPasswords
    });
  } catch (error: unknown) {
    console.error('Database connection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ 
      message: 'Failed to connect to database',
      error: errorMessage
    });
  }
}
