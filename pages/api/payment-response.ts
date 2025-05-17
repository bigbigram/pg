import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyData } from '../../utils/pkiUtils';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Verify message type
    if (data.bfs_msgType !== 'AR') {
      return res.status(400).json({ 
        error: 'Invalid message type',
        expected: 'AR',
        received: data.bfs_msgType 
      });
    }

    const checkSumString = [
      data.bfs_benfId,
      data.bfs_benfTxnTime,
      data.bfs_bfsTxnId,
      data.bfs_bfsTxnTime,
      data.bfs_debitAuthCode,
      data.bfs_debitAuthNo,
      data.bfs_msgType,  // Should be 'AR'
      data.bfs_orderNo,
      data.bfs_remitterBankId,
      data.bfs_remitterName,
      data.bfs_txnAmount,
      data.bfs_txnCurrency
    ].join('|');

    const isValid = await verifyData(checkSumString, data.bfs_checkSum);

    if (!isValid) {
      return res.status(400).json({ 
        status: 'PKI Verification fail',
        verified: false,
        data 
      });
    }

    // Update transaction status based on AR response
    const transactionStatus = data.bfs_debitAuthCode === '00' ? 'COMPLETED' : 'FAILED';
    
    // Update transaction in database
    try {
      await prisma.transaction.update({
        where: { orderNo: data.bfs_orderNo },
        data: {
          status: transactionStatus,
          metadata: {
            ...data,
            responseTimestamp: new Date().toISOString()
          }
        }
      });
    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return res.status(500).json({ error: 'Failed to update transaction' });
    }

    res.status(200).json({ 
      status: transactionStatus, 
      verified: true, 
      data 
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
