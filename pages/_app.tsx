import { SessionProvider } from 'next-auth/react';
import Layout from '../components/Layout';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={true}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}

export default App;
