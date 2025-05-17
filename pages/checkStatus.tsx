import { useState } from 'react';

export default function CheckStatus() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/checkStatus', {
        method: 'POST'
      });
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      setStatus('Error checking status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={checkStatus} disabled={loading}>
        {loading ? 'Checking...' : 'Check Status'}
      </button>
      {status && <div>Status: {status}</div>}
    </div>
  );
}
