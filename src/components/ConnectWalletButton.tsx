import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import React from "react";
import { useWallet } from "../hooks/useWallet";
import LocalizedStrings from "react-localization";

let strings = new LocalizedStrings({
  en: {
    disconnect: "Disconnect",
    connect: "Connect Wallet",
  },
});

export const ConnectWalletButton: React.FC = () => {
  const { connect, disconnect, wallet, isConnected } = useWallet();
  const { address } = wallet ?? {};

  if (isConnected) {
    return (
      <Menu>
        {({ isOpen }) => (
          <>
            <MenuButton isActive={isOpen} as={Button} size="md">
              {address && address.slice(0, 8)}
            </MenuButton>
            <MenuList background="#000">
              <MenuItem onClick={disconnect}>{strings.disconnect}</MenuItem>
            </MenuList>
          </>
        )}
      </Menu>
    );
  }

  return (
    <Button size="md" onClick={connect}>
      {strings.connect}
    </Button>
  );
};
