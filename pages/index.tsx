import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('Checking connection...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(() => setStatus('Server connected'))
      .catch(err => setStatus('Connection failed: ' + err.message));
  }, []);

  return (
    <div className="p-8">
      <h1>RMA Integration</h1>
      <p>Status: {status}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/dashboard',
      permanent: false,
    },
  };
};
