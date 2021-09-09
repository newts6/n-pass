import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers } from "ethers";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Web3Modal from "web3modal";
import { INFURA_API_KEY } from "../../networks/base";

export const PROVIDER_OPTIONS = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: INFURA_API_KEY, // required
    },
  },
};

export type WalletProviderProps = {};

export const WalletContext = React.createContext<WalletContextValue>({
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  wallet: null,
  loading: true,
});

let web3Modal: Web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions: PROVIDER_OPTIONS,
  });
}

export type WalletStatus = {
  address: string;
  chainId: number;
  web3Provider: providers.Web3Provider;
  provider: any;
};

export type WalletContextValue = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  loading: boolean;
  wallet: WalletStatus | null;
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const connect = useCallback(async function () {
    setLoading(true);
    const provider = await web3Modal.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    const network = await web3Provider.getNetwork();

    setWallet({
      address,
      chainId: network.chainId,
      provider,
      web3Provider,
    });
    setLoading(false);
  }, []);

  const provider = wallet?.provider;
  const disconnect = useCallback(async () => {
    await web3Modal.clearCachedProvider();
    if (provider?.disconnect && typeof provider.disconnect === "function") {
      await provider.disconnect();
    }
    setWallet(null);
  }, [provider]);

  useEffect(() => {
    if (web3Modal && web3Modal.cachedProvider) {
      void connect();
    } else {
      setLoading(false);
    }
  }, [connect]);

  useEffect(() => {
    if (!provider?.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("accountsChanged", accounts);
      setWallet(wallet => {
        if (wallet === null) return null;
        const newAccount = accounts[0];
        if (!newAccount) return wallet;

        return {
          ...wallet,
          address: newAccount,
        };
      });
    };

    const handleChainChanged = (chainId: string) => {
      const parsedChainId = parseInt(chainId, 16);
      console.log("chainChanged", parsedChainId);
      setWallet(wallet => {
        if (wallet === null) return null;

        return {
          ...wallet,
          chainId: parsedChainId,
        };
      });
    };

    const handleDisconnect = (error: { code: number; message: string }) => {
      console.log("disconnect", error);
      void disconnect();
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    provider.on("disconnect", handleDisconnect);

    // Subscription Cleanup
    return () => {
      if (provider.removeListener) {
        provider.removeListener("accountsChanged", handleAccountsChanged);
        provider.removeListener("chainChanged", handleChainChanged);
        provider.removeListener("disconnect", handleDisconnect);
      }
    };
  }, [provider, disconnect]);

  return (
    <WalletContext.Provider
      value={{
        connect,
        disconnect,
        wallet,
        loading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export type UseWalletValue = WalletContextValue & {
  isConnected: boolean;
  address?: string;
};

export function useWallet(): UseWalletValue {
  const walletCtx = React.useContext<WalletContextValue>(WalletContext);
  const { wallet } = walletCtx;
  const isConnected = useMemo(() => Boolean(wallet), [wallet]);

  return {
    ...walletCtx,
    isConnected,
    address: wallet?.address ?? undefined,
  };
}
