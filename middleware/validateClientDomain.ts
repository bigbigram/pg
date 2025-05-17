import type { NextApiRequest } from 'next';
import prisma from '../lib/prisma';

export async function validateClientDomain(
  req: NextApiRequest,
  clientId: string,
  apiKey: string,
  domain: string
) {
  console.log('Starting domain validation:', { clientId, apiKey, domain });

  // Handle development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode - checking credentials only');
    const domainInfo = await prisma.allowedDomain.findFirst({
      where: {
        clientId,
        apiKey,
        isActive: true
      }
    });
    console.log('Development domain found:', domainInfo);
    return domainInfo;
  }

  // Production validation
  const domainInfo = await prisma.allowedDomain.findFirst({
    where: {
      AND: [
        { clientId },
        { apiKey },
        {
          OR: [
            { domain },
            { domain: domain.replace('lottery.', '') } // Handle subdomain
          ]
        },
        { isActive: true }
      ]
    }
  });

  console.log('Production domain validation result:', {
    found: !!domainInfo,
    domainId: domainInfo?.id
  });

  if (!domainInfo) {
    throw new Error(`Domain validation failed for: ${domain}`);
  }

  return domainInfo;
}
