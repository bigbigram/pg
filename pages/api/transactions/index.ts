import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Client-ID, X-API-Key, X-Domain'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check for authenticated session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let whereClause = {};
    
    // If not admin, only show transactions for their domain
    if (session.user.role !== 'ADMIN') {
      whereClause = {
        domainId: session.user.domainId // Assuming user has domainId in their session
      };
    }

    const transactions = await prisma.transaction.findMany({
      select: {
        id: true,
        orderNo: true,
        amount: true,
        currency: true,
        status: true,
        checksum: true, // Explicitly select checksum
        clientRefId: true,
        createdAt: true,
        metadata: true,
        domain: {
          select: {
            domain: true,
            clientName: true
          }
        }
      },
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    console.log('Transactions with checksums:', transactions);

    res.status(200).json(transactions);
  } catch (error: any) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      details: process.env.NODE_ENV === 'development' ? 
        error?.message || String(error) : 
        undefined
    });
  }
}
