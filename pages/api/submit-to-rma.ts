import type { NextApiRequest, NextApiResponse } from 'next';
import { validateClientDomain } from '../../middleware/validateClientDomain';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the payment parameters 
    const paymentData = req.body;
    const transactionId = paymentData.merchantTxnNo;

    // Fetch and verify transaction from database
    const transaction = await prisma.transaction.findUnique({
      where: { orderNo: transactionId }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify checksum
    if (transaction.checksum !== paymentData.checksum) {
      return res.status(400).json({ error: 'Invalid checksum' });
    }

    // Send HTML response that auto-submits to RMA
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
        <body>
          <form id="rmaForm" method="POST" action="https://bfssecure.rma.org.bt/BFSSecure/makePayment">
            ${Object.entries(paymentData)
              .map(([key, value]) => 
                `<input type="hidden" name="${key}" value="${value}">`
              )
              .join('')}
          </form>
          <script>document.getElementById('rmaForm').submit();</script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('RMA submission error:', error);
    res.status(500).json({
      error: 'Failed to process payment',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    });
  }
}
