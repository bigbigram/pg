import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { domain, clientName, redirectUrl, serverIp, clientDomain } = req.body;

    // Validate required fields
    if (!domain || !clientName || !redirectUrl || !serverIp || !clientDomain) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Domain, client name, server IP, client domain and redirect URL are required'
      });
    }

    // Validate IP format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(serverIp)) {
      return res.status(400).json({
        error: 'Invalid format',
        details: 'Please provide a valid IPv4 address'
      });
    }

    const createdDomain = await prisma.allowedDomain.create({
      data: {
        ...req.body,
        updatedAt: new Date()
      }
    });

    res.status(201).json(createdDomain);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to create domain',
      details: error.message
    });
  }
}
