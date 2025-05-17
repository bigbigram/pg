import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PaymentRedirect() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { bfs_checkSum, ...params } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    try {
      if (!bfs_checkSum) {
        throw new Error('Missing checksum parameter');
      }

      const bfsEndpoint = process.env.NEXT_PUBLIC_BFS_ENDPOINT || 'https://bfssecure.rma.org.bt';
      const bfsPaymentPath = process.env.NEXT_PUBLIC_BFS_PAYMENT_PATH || '/BFSSecure/PaymentRequest';
      const formAction = `${bfsEndpoint}${bfsPaymentPath}`;

      console.log('Creating form with action:', formAction);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = formAction;
      form.style.display = 'none';

      const allParams = { ...params, bfs_checkSum };
      console.log('Submitting parameters:', allParams);

      Object.entries(allParams).forEach(([key, value]) => {
        if (value) {  // Only add if value exists
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      
      // Submit after a short delay to ensure form is in DOM
      setTimeout(() => {
        try {
          form.submit();
        } catch (submitError) {
          console.error('Form submission failed:', submitError);
          setError('Failed to submit payment form');
        } finally {
          // Cleanup form
          document.body.removeChild(form);
        }
      }, 100);

    } catch (error) {
      console.error('Redirect error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process payment redirect');
    }
  }, [router.isReady, router.query]);

  if (error) {
    return (
      <div className="container error">
        <h1>Payment Error</h1>
        <p>{error}</p>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Redirecting to Payment Gateway...</h1>
      <div className="loader"></div>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .loader {
          border: 4px solid #f3f3f3;
          border-radius: 50%;
          border-top: 4px solid #3498db;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .container.error {
          color: red;
        }
      `}</style>
    </div>
  );
}
