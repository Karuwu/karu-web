// pages/_app.tsx

import type { AppProps } from 'next/app';
import ThemeRegistry from '../components/ThemeRegistry';
import Layout from '../components/layout';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeRegistry>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeRegistry>
  );
}