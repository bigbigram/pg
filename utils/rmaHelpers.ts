import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { RMA_CONFIG } from '../config/constants';
import type { BFSParams } from '../types/bfs';

const PKI_KEY_PATH = path.resolve(process.cwd(), 'WebContent', 'pki', 'BE10000001.key');

export const generateBFSChecksum = (params: BFSParams): string => {
  // Sort parameters in required order
  const orderedFields = [
    'bfs_benfBankCode',
    'bfs_benfId',
    'bfs_orderNo',
    'bfs_msgType',
    'bfs_benfTxnTime',
    'bfs_paymentDesc',
    'bfs_remitterEmail',
    'bfs_txnAmount',
    'bfs_txnCurrency',
    'bfs_version'
  ];

  // Create source string with pipe separator
  const sourceString = orderedFields
    .map(field => params[field as keyof BFSParams])
    .join('|');

  console.log('Source string:', sourceString); // For debugging

  // Sign using private key
  const privateKey = fs.readFileSync(PKI_KEY_PATH, 'utf8');
  const sign = crypto.createSign('SHA256');
  sign.update(sourceString);
  const signature = sign.sign(privateKey, 'hex').toUpperCase();

  return signature;
};
