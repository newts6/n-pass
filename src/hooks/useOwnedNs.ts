import { useCallback, useEffect, useState } from "react";
import { getNsByOwnerWithContract, getNsByOwnerWithGraph, SubgraphN } from "../clients/n";
import { useMainContract } from "./useMainContract";
import { useNContract } from "./useNContract";
import { useWallet } from "./useWallet";

export type NWithAvailability = {
  available: boolean;
  n: SubgraphN;
};

export type UseWalletNsValue = {
  availableNs: Array<NWithAvailability> | undefined;
  loading: boolean;
};

export function useOwnedNs(cacheKey?: any): UseWalletNsValue {
  const { address } = useWallet();
  const [availableNs, setAvailableNs] = useState<Array<NWithAvailability> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const { mainContract } = useMainContract();
  const { nContract } = useNContract();

  const checkAvailability = useCallback(
    async (tokenId: number): Promise<boolean> => {
      if (!process.browser) return true;

      try {
        return !(await mainContract.ownerOf(tokenId));
      } catch (e) {
        return true;
      }
    },
    [mainContract],
  );

  const fetchWalletNs = useCallback(
    async (address: string): Promise<void> => {
      setLoading(true);
      let walletNs;
      if (process.env.NODE_ENV === "production") {
        walletNs = await getNsByOwnerWithGraph(address);
      } else {
        walletNs = await getNsByOwnerWithContract(address, nContract);
      }
      const nsWithAvailability = await Promise.all(
        walletNs.map(async (n): Promise<NWithAvailability> => {
          const numericId = parseInt(n.id);
          const available = await checkAvailability(numericId);
          return {
            available,
            n,
          };
        }),
      );
      setAvailableNs(nsWithAvailability);
      setLoading(false);
    },
    [checkAvailability],
  );

  useEffect(() => {
    if (address) {
      fetchWalletNs(address);
    } else {
      setAvailableNs(undefined);
    }
  }, [address, fetchWalletNs, cacheKey]);

  return {
    availableNs,
    loading,
  };
}
