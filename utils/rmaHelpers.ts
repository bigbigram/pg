import crypto from 'crypto';
import { RMA_CONFIG } from '../config/constants';

interface RMAParams {
  merchantId: string;
  merchantTxnNo: string;
  amount: string;
  currency: string;
  description: string;
  customerEmail: string;
  merchantKey: string;
  callbackUrl: string;
  returnUrl: string;
  cancelUrl: string;
}

export function generateRMAChecksum(params: RMAParams): string {
  // Order of fields matters for checksum
  const checksumString = [
    params.merchantId,
    params.merchantTxnNo,
    params.amount,
    params.currency,
    params.description,
    params.customerEmail,
    params.merchantKey
  ].join('|');

  return crypto
    .createHash('sha256')
    .update(checksumString)
    .digest('hex');
}
