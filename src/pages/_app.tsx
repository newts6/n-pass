import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/900.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import * as React from "react";
import { BackupProviderProvider } from "../hooks/useBackupProvider";
import { WalletProvider } from "../hooks/useWallet";
import "../styles/globals.css";
import theme from "../styles/theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>n-pass</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;800&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Bowlby+One+SC&display=swap" rel="stylesheet"></link>
      </Head>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <BackupProviderProvider>
          <WalletProvider>
            <Component {...pageProps} />
          </WalletProvider>
        </BackupProviderProvider>
      </ChakraProvider>
    </div>
  );
}

export default MyApp;
