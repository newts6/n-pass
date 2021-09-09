import { useMemo } from "react";
import { getNContractAddress } from "../utils/network";
import { useBackupProvider } from "./useBackupProvider";
import { useWallet } from "./useWallet";
import { IN, IN__factory } from "../../typechain";
export enum ContractConnectionType {
  Injected = 0,
  Fallback = 1,
}

export type UseNContractValue = {
  nContract: IN;
  connectionType: ContractConnectionType;
};

export function useNContract(): UseNContractValue {
  const { provider } = useBackupProvider();
  const { wallet } = useWallet();
  const injectedProvider = wallet?.web3Provider;
  const nContract = useMemo(
    // Only attempt to instantiate the N contract when in browser, not during SSR
    () => {
      if (!process.browser) {
        return null;
      }
      const contractAddress = getNContractAddress();
      console.log(`Connecting to N contract at address: ${contractAddress}`);
      return IN__factory.connect(contractAddress, injectedProvider ?? provider);
    },
    [provider, injectedProvider],
  );

  return {
    nContract: nContract!, // TODO: Come up with a more typesafe way of handling this
    connectionType: injectedProvider ? ContractConnectionType.Injected : ContractConnectionType.Fallback,
  };
}
