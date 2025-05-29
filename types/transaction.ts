import { RMAParams } from './rma';

export type TransactionStatus = 'INITIATED' | 'SUBMITTED' | 'COMPLETED' | 'FAILED';

export type TransactionMetadata = {
  [key: string]: any;
  customerEmail: string;
  description: string;
  successUrl: string;
  failureUrl: string;
  cancelUrl: string;
  clientRefId: string | null;
  checksum?: string;
  bfsParams?: Record<string, string>;
}
