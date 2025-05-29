import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { BFSPKIImplementation } from '../../utils/BFSPKIImplementation';
import { validateClientDomain } from '../../middleware/validateClientDomain';
import prisma from '../../lib/prisma';
import { RMA_CONFIG } from '../../config/constants';
import { generateBFSChecksum } from '../../utils/rmaHelpers';
import { sanitize } from 'isomorphic-dompurify';
import validator from 'validator';
import type { PaymentRequest, SafePaymentRequest } from '../../types/payment';
import { getAllowedOrigins } from '../../utils/getAllowedOrigins';
import type { RMAParams } from '../../types/rma';
import type { TransactionMetadata } from '../../types/transaction';

const PKI_KEY_PATH = path.resolve(process.cwd(), 'WebContent', 'pki', 'BE10000001.key');

export const config = {
  api: {
    bodyParser: true,
    externalResolver: false,
  },
};

// Helper to run middleware
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Function) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get allowed origins dynamically
  const allowedOrigins = await getAllowedOrigins();
  const origin = req.headers.origin;

  // CORS check with dynamic origins
  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-client-id, x-domain');
    return res.status(200).end();
  }

  // Sanitize and validate input with proper typing
  const sanitizedBody = Object.entries(req.body).reduce<SafePaymentRequest>((acc, [key, value]) => ({
    ...acc,
    [key]: typeof value === 'string' ? sanitize(String(value)) : value
  }), {});

  // Type guard to verify all required fields
  const isValidPaymentRequest = (data: SafePaymentRequest): data is PaymentRequest => {
    const requiredFields: (keyof PaymentRequest)[] = [
      'bfs_msgType',
      'bfs_benfId',
      'bfs_orderNo',
      'bfs_benfTxnTime',
      'bfs_benfBankCode',
      'bfs_txnCurrency',
      'bfs_txnAmount',
      'bfs_remitterEmail',
      'bfs_paymentDesc',
      'bfs_version',
      'successUrl',
      'failureUrl',
      'cancelUrl'
    ];

    return requiredFields.every(field => typeof data[field] === 'string');
  };

  if (!isValidPaymentRequest(sanitizedBody)) {
    return res.status(400).json({ error: 'Invalid or missing required fields' });
  }

  const formData = sanitizedBody;

  // Validate amount format with type safety
  if (!validator.isCurrency(String(formData?.bfs_txnAmount || ''))) {
    return res.status(400).json({ error: 'Invalid amount format' });
  }

  // Validate email with type safety
  if (!validator.isEmail(formData?.bfs_remitterEmail || '')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Set JSON headers
  res.setHeader('Content-Type', 'application/json');

  try {
    const clientId = req.headers['x-client-id'];
    const apiKey = req.headers['x-api-key'];
    const domain = req.headers['x-domain'];

    console.log('Received headers:', {
      clientId,
      apiKey,
      domain
    });

    const domainInfo = await validateClientDomain(
      req,
      String(clientId),
      String(apiKey),
      String(domain)
    );

    if (!domainInfo) {
      return res.status(401).json({
        error: 'Invalid domain credentials'
      });
    }

    console.log('Validated domain info:', {
      id: domainInfo.id,
      domain: domainInfo.domain
    });

    // Continue with payment processing using validated domainInfo
    try {
      // Type assertion for formData
      const formData = sanitizedBody as PaymentRequest;

      if (typeof formData !== 'object' || formData === null) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }

      console.log('Processing payment request:', formData);

      if (!formData) {
        return res.status(400).json({ error: 'Request body is empty' });
      }

      const requiredFields = [
        'bfs_msgType',
        'bfs_benfId',
        'bfs_orderNo',
        'bfs_benfTxnTime',
        'bfs_benfBankCode',
        'bfs_txnCurrency',
        'bfs_txnAmount',
        'bfs_remitterEmail',
        'bfs_paymentDesc',
        'bfs_version',
        'successUrl',  // New required field
        'failureUrl',   // New required field
        'cancelUrl'     // New required field
      ];

      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof PaymentRequest];
        return !value;
      });
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }

      try {
        // Prepare BFS parameters before transaction creation
        const bfsParams = {
          bfs_msgType: formData.bfs_msgType,
          bfs_benfId: formData.bfs_benfId,
          bfs_orderNo: formData.bfs_orderNo,
          bfs_benfTxnTime: formData.bfs_benfTxnTime,
          bfs_benfBankCode: formData.bfs_benfBankCode,
          bfs_txnCurrency: formData.bfs_txnCurrency,
          bfs_txnAmount: Number(formData.bfs_txnAmount).toFixed(2),
          bfs_remitterEmail: formData.bfs_remitterEmail,
          bfs_paymentDesc: formData.bfs_paymentDesc,
          bfs_version: formData.bfs_version
        };

        const checksum = generateBFSChecksum(bfsParams);

        const transaction = await prisma.transaction.create({
          data: {
            orderNo: formData.bfs_orderNo,
            domain: {
              connect: {
                id: domainInfo.id
              }
            },
            amount: parseFloat(formData.bfs_txnAmount),
            currency: formData.bfs_txnCurrency,
            status: 'INITIATED',
            checksum: checksum, // Now checksum exists when we create the transaction
            metadata: {
              customerEmail: formData.bfs_remitterEmail,
              description: formData.bfs_paymentDesc,
              successUrl: formData.successUrl,
              failureUrl: formData.failureUrl,
              cancelUrl: formData.cancelUrl,
              clientRefId: formData.clientRefId || null,
              bfsParams
            }
          }
        });
        console.log('Transaction created:', transaction);

        // Convert metadata to plain object for JSON compatibility
        const metadataObj = {
          customerEmail: formData.bfs_remitterEmail,
          description: formData.bfs_paymentDesc,
          successUrl: formData.successUrl,
          failureUrl: formData.failureUrl,
          cancelUrl: formData.cancelUrl,
          clientRefId: formData.clientRefId || null,
          checksum,
          bfsParams
        } as const;

        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            metadata: metadataObj
          }
        });

        // Return BFS payment parameters
        return res.status(200).json({
          success: true,
          paymentParams: {
            ...bfsParams,
            bfs_checkSum: checksum
          },
          transactionId: transaction.id
        });
      } catch (error) {
        console.error('Transaction error details:', error);
        return res.status(500).json({ 
          error: 'Failed to create transaction',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    } catch (error: any) {
      console.error('API Error:', error);
      if (!res.writableEnded) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
        });
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
