export interface TransactionMetadata {  [key: string]: any;
  customerEmail: string;
  description: string;
  successUrl: string;
  failureUrl: string;
  rmaTransactionId?: string;
  rmaMessage?: string;
}
