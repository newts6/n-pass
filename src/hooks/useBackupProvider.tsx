import { ethers } from "ethers"
import React, { useMemo } from "react"
import { getNetworkConfig } from "../utils/network"

export type BackupProviderContextValue = {
  provider: any
}

export const BackupProviderContext = React.createContext<BackupProviderContextValue>({
  provider: null,
})

export const BackupProviderProvider: React.FC = ({ children }) => {
  const provider = useMemo(() => process.browser ? new ethers.providers.JsonRpcProvider(getNetworkConfig().rpcUrl) : null, [])
  return (
    <BackupProviderContext.Provider value={{
      provider,
    }}>
      {children}
    </BackupProviderContext.Provider>
  )
}

export type UseBackupProviderValue = BackupProviderContextValue

export function useBackupProvider(): UseBackupProviderValue {
  return React.useContext<BackupProviderContextValue>(BackupProviderContext)
}
