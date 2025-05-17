import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const domain = await prisma.allowedDomain.findUnique({
      where: { id: Number(id) },
      include: {
        transactions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    res.status(200).json(domain);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch domain details' });
  }
}
