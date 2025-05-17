import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const domains = await prisma.allowedDomain.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        domain: true,
        clientName: true,
        clientId: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(200).json(domains);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
}
