import { EthNetwork, EthNetworkConfig, NETWORK_CONFIG } from "../../networks/network";

export function getCurrentNetwork(): EthNetwork {
  const envVarNetName = process.env.NEXT_PUBLIC_ETH_NETWORK ?? "mainnet";
  const ethNetwork: EthNetwork = EthNetwork[envVarNetName.toLowerCase() as EthNetwork];
  if (!ethNetwork) {
    throw new Error(`Unrecognized network found: ${envVarNetName}`);
  }
  return ethNetwork;
}

export function getNetworkConfig(): EthNetworkConfig {
  return NETWORK_CONFIG[getCurrentNetwork()];
}

export function getNContractAddress(): string {
  return getNetworkConfig().contractConfig.nContractAddress;
}

export function getMainContractAddress(): string {
  return getNetworkConfig().contractConfig.mainContractAddress;
}

export function getNGraphUrl(): string {
  return getNetworkConfig().nGraphUrl;
}

export function getBaseFrontendUrl(): string {
  return getNetworkConfig().baseFrontendUrl;
}

export function getBlockExplorerUrl(): string | undefined {
  return getNetworkConfig().blockExplorer;
}
