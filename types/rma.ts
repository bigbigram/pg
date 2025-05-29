export interface RMAParams {
  merchantId: string;
  merchantTxnNo: string;
  amount: string;
  currency: string;
  description: string;
  customerEmail: string;
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
  merchantKey: string;
}
