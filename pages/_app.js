import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
import Head from "next/head";
import "../styles/globals.css";

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mainnet;

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <ThirdwebProvider desiredChainId={activeChainId}>
      <Head>
        <title> Trust Wallet Dashboard </title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <Component {...pageProps} />
    </ThirdwebProvider>
  </div>
  );
}

export default MyApp
