import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PaymentResponse() {
  const [response, setResponse] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (router.query && Object.keys(router.query).length > 0) {
      fetch('/api/payment-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(router.query)
      })
      .then(res => res.json())
      .then(data => setResponse(data));
    }
  }, [router.query]);

  if (!response) return <div>Processing...</div>;

  const { data, status, verified } = response;

  return (
    <div>
      <h2>Payment Status: {status}</h2>
      {!verified && <p>Warning: PKI Verification failed</p>}
      <table style={{ width: '50%' }}>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value as string}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
