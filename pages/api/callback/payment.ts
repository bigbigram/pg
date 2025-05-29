import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

interface PaymentCallbackData {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paymentDetails: Record<string, any>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transactionId, status, paymentDetails } = req.body as PaymentCallbackData;

  try {
    const transaction = await prisma.transaction.update({
      where: { id: String(transactionId) },
      data: {
        status,
        metadata: JSON.parse(JSON.stringify(paymentDetails))
      }
    });

    // Notify client's webhook if configured
    if (transaction.domainId) {
      const domain = await prisma.allowedDomain.findUnique({
        where: { id: transaction.domainId }
      });

      if (domain?.webhookUrl) {
        await fetch(domain.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNo: transaction.orderNo,
            status,
            amount: transaction.amount,
            currency: transaction.currency,
            timestamp: new Date().toISOString()
          })
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Callback error:', error);
    return res.status(500).json({ error: 'Failed to process callback' });
  }
}
