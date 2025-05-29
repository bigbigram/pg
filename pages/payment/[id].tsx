import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import prisma from '../../lib/prisma';
import { TransactionMetadata } from '../../types/transaction';

interface PaymentParams {
  merchantId: string;
  merchantTxnNo: string;
  amount: string;
  currency: string;
  description: string;
  customerEmail?: string;
  merchantKey: string;
  callbackUrl: string;
  returnUrl?: string;
  cancelUrl?: string;
  checksum: string;
}

interface PaymentPageProps {
  transaction: {
    id: number;
    orderNo: string;
    amount: string;
    currency: string;
    status: string;
    checksum: string;
    metadata: TransactionMetadata;
    domain?: {
      name: string;
    };
    paymentParams: PaymentParams;
  };
}

export default function PaymentPage({ transaction }: PaymentPageProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-submit form when component mounts
    const form = document.getElementById('payment-form') as HTMLFormElement;
    if (form) {
      form.submit();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Redirecting to Payment Gateway</h1>
        <div className="mb-6">
          <p>Please wait while we redirect you to the secure payment gateway...</p>
        </div>

        <form
          id="payment-form"
          method="POST"
          action="https://bfssecure.rma.org.bt/BFSSecure/makePayment"
          className="hidden"
        >
          {Object.entries(transaction.paymentParams).map(([key, value]) => (
            <input
              key={key}
              type="hidden"
              name={key}
              value={String(value)}
            />
          ))}
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: String(params?.id) },
    include: { domain: true }
  });

  if (!transaction) {
    return { notFound: true };
  }

  const metadata = transaction.metadata as TransactionMetadata;

  const paymentParams = {
    merchantId: process.env.RMA_MERCHANT_ID,
    merchantTxnNo: transaction.orderNo,
    amount: transaction.amount.toString(),
    currency: transaction.currency,
    description: metadata.description || `Order ${transaction.orderNo}`,
    customerEmail: metadata.customerEmail,
    merchantKey: process.env.RMA_MERCHANT_KEY,
    callbackUrl: `${process.env.NEXT_PUBLIC_URL}/api/callback/rma/${transaction.id}`,
    returnUrl: metadata.successUrl,
    failureUrl: metadata.failureUrl,
    cancelUrl: metadata.cancelUrl,
    checksum: transaction.checksum
  };

  return {
    props: {
      transaction: {
        ...JSON.parse(JSON.stringify(transaction)),
        paymentParams
      }
    }
  };
};
