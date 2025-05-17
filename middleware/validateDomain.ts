import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../lib/prisma';

export async function validateDomain(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: () => Promise<any>
) {
  const clientId = req.headers['x-client-id'];
  const apiKey = req.headers['x-api-key'];
  const domain = req.headers['x-domain'];

  if (!clientId || !apiKey || !domain) {
    return res.status(401).json({ error: 'Missing authentication headers' });
  }

  try {
    const domainInfo = await prisma.allowedDomain.findFirst({
      where: {
        AND: [
          { clientId: String(clientId) },
          { apiKey: String(apiKey) },
          { domain: String(domain) },
          { isActive: true }
        ]
      }
    });

    if (!domainInfo) {
      return res.status(401).json({ error: 'Invalid credentials or domain' });
    }

    (req as any).domainInfo = domainInfo;
    return await handler();
  } catch (error) {
    console.error('Domain validation error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
