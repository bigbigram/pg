import type { NextApiRequest, NextApiResponse } from 'next';
import type { BFSSubmitData } from '../../types/bfs';
import { validateClientDomain } from '../../middleware/validateClientDomain';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const paymentData = req.body as Partial<BFSSubmitData>;
    
    // Validate required BFS fields
    const requiredFields: (keyof BFSSubmitData)[] = [
      'bfs_msgType',
      'bfs_orderNo',
      'bfs_benfTxnTime',
      'bfs_checkSum'
    ];

    const missingFields = requiredFields.filter(field => !paymentData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Fetch transaction with null check
    const transaction = await prisma.transaction.findUnique({
      where: {
        orderNo: String(paymentData.bfs_orderNo)
      },
      include: {
        domain: true
      }
    });

    if (!transaction) {
      console.error('Transaction not found:', paymentData.bfs_orderNo);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify checksum from metadata
    const storedMetadata = transaction.metadata as Record<string, any> || {};
    const storedChecksum = storedMetadata.checksum;
    
    console.log('Checksum comparison:', {
      stored: storedChecksum,
      received: paymentData.bfs_checkSum,
      metadata: storedMetadata
    });

    if (!storedChecksum || storedChecksum !== paymentData.bfs_checkSum) {
      console.error('Checksum mismatch:', {
        stored: storedChecksum,
        received: paymentData.bfs_checkSum,
        orderNo: paymentData.bfs_orderNo
      });
      return res.status(400).json({ error: 'Invalid checksum' });
    }

    // HTML escape function for form values
    const escapeHtml = (unsafe: string) => 
      unsafe.replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[c] || c));

    // Send HTML response with escaped values
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
        <body>
          <form id="rmaForm" method="POST" action="https://bfssecure.rma.org.bt/BFSSecure/makePayment">
            ${Object.entries(paymentData)
              .map(([key, value]) => 
                `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(String(value))}">`
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
