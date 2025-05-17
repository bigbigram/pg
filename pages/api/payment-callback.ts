import type { NextApiRequest, NextApiResponse } from 'next';
import { generateResponseChecksum } from '../../utils/checksumUtils';
import { BFSPKIImplementation } from '../../utils/BFSPKIImplementation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = req.body;
    const checkSum = generateResponseChecksum(data);
    const isValid = await BFSPKIImplementation.verifyData(
      process.env.PKI_PUBLIC_KEY_PATH!,
      checkSum,
      data.bfs_checkSum,
      'SHA1withRSA'
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid checksum' });
    }

    // Handle response codes
    if (data.bfs_debitAuthCode === '00') {
      res.status(200).json({ status: 'success', data });
    } else {
      res.status(400).json({ 
        status: 'failed', 
        error: `Transaction failed with code: ${data.bfs_debitAuthCode}`,
        data 
      });
    }
  } catch (error: unknown) {
    res.status(500).json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` 
    });
  }
}
