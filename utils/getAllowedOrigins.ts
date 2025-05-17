import prisma from '../lib/prisma';

export async function getAllowedOrigins(): Promise<string[]> {
  // Get static origins from env
  const staticOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  // Get active domains from database
  type Domain = { domain: string };
  const dbDomains = await prisma.allowedDomain.findMany({
    where: { isActive: true },
    select: { domain: true }
  });

  // Combine and deduplicate origins
  const allOrigins = new Set([
    ...staticOrigins,
    ...dbDomains.map((d: Domain) => `https://${d.domain}`),
    ...dbDomains.map((d: Domain) => `http://${d.domain}`)
  ]);

  return Array.from(allOrigins);
}
