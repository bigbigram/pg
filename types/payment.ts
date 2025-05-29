export interface PaymentRequest {
  bfs_msgType: string;
  bfs_benfId: string;
  bfs_orderNo: string;
  bfs_benfTxnTime: string;
  bfs_benfBankCode: string;
  bfs_txnCurrency: string;
  bfs_txnAmount: string;
  bfs_remitterEmail: string;
  bfs_paymentDesc: string;
  bfs_version: string;
  successUrl: string;
  failureUrl: string;
  cancelUrl: string;
  clientRefId?: string;
}

export type SafePaymentRequest = Partial<PaymentRequest>;
