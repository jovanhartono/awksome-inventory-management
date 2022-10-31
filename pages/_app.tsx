import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from "../components/layout";
import { SWRConfig } from "swr";
import axios from "lib/axios";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Awksome Stock Management</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" type="image/x-icon" href="/logo.webp" />
        <link
          rel="preload"
          href="/inter-var-font.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </Head>
      <SWRConfig
        value={{
          fetcher: (resource: string, init) =>
            axios.get(resource, init).then((res) => res.data),
        }}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SWRConfig>
    </>
  );
}

export default MyApp;
