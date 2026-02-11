import type { AppProps } from 'next/app';
import '../styles/globals.css';

import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Finanzas App</title>
        <meta name="description" content="Control inteligente de ingresos y gastos familiares" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
