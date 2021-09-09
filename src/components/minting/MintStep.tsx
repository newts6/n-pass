import { Alert, AlertIcon, Box, Button, Heading, Link, Text } from "@chakra-ui/react";
import React, { useCallback, useMemo, useState } from "react";
import { SubgraphN } from "../../clients/n";
import { useMainContract } from "../../hooks/useMainContract";
import { useWallet } from "../../hooks/useWallet";
import { parseWalletError } from "../../utils/error";
import { getBlockExplorerUrl } from "../../utils/network";
import NCard from "../NCard/NCard";
import LocalizedStrings from "react-localization";

let strings = new LocalizedStrings({
  en: {
    title: "Mint n-pass",
    partialExplanation: "You are about to mint a n-pass with N #",
    error: "Error:",
    progess: "Minting in progress",
    viewTx: "Click to view transaction",
    cancel: "Cancel",
    mint: "Mint",
  },
});

export type MintStepProps = {
  selectedN: SubgraphN;
  onCancel: () => void;
  onSuccess: () => void;
};

export const MintStep: React.FC<MintStepProps> = ({ selectedN, onCancel, onSuccess }) => {
  const { wallet } = useWallet();
  const provider = wallet?.web3Provider;
  const { mainContract } = useMainContract();
  const [isMinting, setIsMinting] = useState(false);
  const [mintingTxn, setMintingTxn] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const numericId = parseInt(selectedN.id);

  const handleMint = useCallback(async () => {
    if (!provider) return;
    try {
      setIsMinting(true);
      setErrorMessage(null);
      const signer = provider.getSigner();
      const contractWithSigner = mainContract.connect(signer);

      const result = await contractWithSigner.mintWithN(numericId);

      setMintingTxn(result.hash);
      await result.wait();
      onSuccess();
    } catch (e) {
      // @ts-ignore
      window.MM_ERR = e;
      console.error(`Error while minting: ${e.message}`);
      setMintingTxn(null);
      setErrorMessage(parseWalletError(e) ?? "Unexpected Error");
    } finally {
      setIsMinting(false);
    }
  }, [provider, mainContract, numericId, onSuccess]);

  const transactionUrl: string | undefined = useMemo(() => {
    if (!mintingTxn || !isMinting) {
      return;
    }
    const blockExplorerUrl = getBlockExplorerUrl();
    if (!blockExplorerUrl) {
      return;
    }
    return `${blockExplorerUrl}/tx/${mintingTxn}`;
  }, [isMinting, mintingTxn]);

  return (
    <Box textAlign="center" width="full">
      <Heading as="h1" size="4xl" fontSize={["2xl", "3xl", "4xl"]} mb={4}>
        {strings.title}
      </Heading>
      <Text>
        {strings.partialExplanation}
        {selectedN.id}
      </Text>
      <Box
        maxWidth="400px"
        width="90%"
        marginX="auto"
        marginY={3}
        borderWidth="4px"
        borderColor="transparent"
        borderStyle="solid"
      >
        {errorMessage && (
          <Alert status="error" mb={3}>
            <AlertIcon />
            <Text fontWeight="semibold" marginRight={1}>
              {strings.error}
            </Text>
            {errorMessage}
          </Alert>
        )}
        {transactionUrl && (
          <Link href={transactionUrl} target="_blank" rel="noopener noreferrer">
            <Alert status="info" flexDirection={["column", "row"]} mb={3}>
              <AlertIcon />
              <Text fontWeight="semibold" marginRight={2}>
                {strings.progess}
              </Text>
              <Text>{strings.viewTx}</Text>
            </Alert>
          </Link>
        )}

        <Box
          backgroundColor="gray.800"
          borderWidth="4px"
          borderColor="transparent"
          borderStyle="solid"
          width="full"
          position="relative"
        >
          <NCard n={selectedN} />
        </Box>
      </Box>
      <Box>
        <Button onClick={onCancel} display="inline-block" mr={2} isDisabled={isMinting}>
          {strings.cancel}
        </Button>
        <Button display="inline-block" ml={2} isLoading={isMinting} onClick={handleMint}>
          {strings.mint}
        </Button>
      </Box>
    </Box>
  );
};
