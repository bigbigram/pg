import type { NextApiRequest, NextApiResponse } from 'next';
import { formatDate } from '../../utils/dateUtils';
import { signData, verifyData } from '../../utils/pkiUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const formData = {
      bfs_msgType: 'AR',
      bfs_benfId: 'BE10000237',
      bfs_benfTxnTime: formatDate(new Date()),
      bfs_orderNo: '20160623145221',
      bfs_benfBankCode: '02',
      bfs_txnCurrency: 'BTN',
      bfs_txnAmount: '100.00',
      bfs_remitterEmail: 'customer@gmail.com',
      bfs_paymentDesc: 'WaterBill',
      bfs_version: '1.0'
    };

    const checkSumString = [
      formData.bfs_benfBankCode,
      formData.bfs_benfId,
      formData.bfs_orderNo,
      formData.bfs_benfTxnTime,
      formData.bfs_msgType,
      formData.bfs_paymentDesc,
      formData.bfs_remitterEmail,
      formData.bfs_txnAmount,
      formData.bfs_txnCurrency,
      formData.bfs_version
    ].join('|');

    // Sign data using PKI implementation
    const signature = await signData(checkSumString);

    // Make request to BFS server
    const response = await fetch('http://localhost:8080/BFSSecure/checkStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ ...formData, bfs_checkSum: signature })
    });

    const responseData = await response.text();
    
    // Process response similar to JSP implementation
    if (responseData.trim() === 'PROCESSING_ERROR') {
      return res.status(400).json({ error: 'Processing Error' });
    }

    const responseMap = new Map();
    responseData.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (value) responseMap.set(key, decodeURIComponent(value));
    });

    // Update verifyData call to include both data and signature
    const isValid = await verifyData(
      responseMap.get('checkSumStr'), 
      responseMap.get('bfs_checkSum')
    );
    
    if (!isValid) {
      return res.status(400).json({ error: 'Checksum verification failed' });
    }

    // Return appropriate status based on debitAuthCode
    const status = getStatusFromAuthCode(responseMap.get('bfs_debitAuthCode'));
    
    res.status(200).json({ status, data: Object.fromEntries(responseMap) });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function getStatusFromAuthCode(code: string): string {
  switch(code) {
    case '00': return 'SUCCESSFUL';
    case '': return 'TRANSACTION IN PROGRESS';
    case 'NF': return 'NO TRANSACTIONS FOUND!';
    case 'IM': return 'INVALID MESSAGE RECEIVED!';
    default: return 'UNSUCCESSFUL';
  }
}
