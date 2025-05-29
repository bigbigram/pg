import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { TransactionMetadata } from '../../../../types/transaction';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { status, txnId, message } = req.body;

  try {
    // Get existing transaction first
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: String(id) }
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = await prisma.transaction.update({
      where: { id: String(id) },
      data: {
        status: status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
        metadata: {
          ...((existingTransaction.metadata || {}) as Record<string, unknown>),
          rmaTransactionId: txnId,
          rmaMessage: message
        }
      }
    });

    // Notify merchant's webhook
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
            status: transaction.status,
            amount: transaction.amount,
            txnId
          })
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('RMA callback error:', error);
    res.status(500).json({ error: 'Failed to process callback' });
  }
}
