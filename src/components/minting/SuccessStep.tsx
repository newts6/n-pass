/* eslint-disable @next/next/no-img-element */

import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SubgraphN } from "../../clients/n";
import { useMainContract } from "../../hooks/useMainContract";
import { getNetworkConfig } from "../../utils/network";
import { ROUTES } from "../../utils/routing";
import LocalizedStrings from "react-localization";
import { parseAndExtractImageFromURI } from "../../utils/metadata";

let strings = new LocalizedStrings({
  en: {
    title: "Mint n-pass",
    success: "Success! You have minted #",
    viewOS: "View on OpenSea",
    done: "Done",
  },
});

export type SuccessStepProps = {
  selectedN: SubgraphN;
};

export const SuccessStep: React.FC<SuccessStepProps> = ({ selectedN }) => {
  const { mainContract } = useMainContract();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const router = useRouter();

  const numericId = parseInt(selectedN.id);

  const retrieveSvg = useCallback(
    async (tokenId: number) => {
      const metadataURI = await mainContract.tokenURI(tokenId);
      const svgData = parseAndExtractImageFromURI(metadataURI);
      setSvgContent(svgData);
    },
    [mainContract],
  );

  const handleDone = useCallback(() => {
    router.push(ROUTES.Home);
  }, [router]);

  useEffect(() => {
    retrieveSvg(numericId);
  }, [retrieveSvg, numericId]);

  const openSeaUrl: string | undefined = useMemo(() => {
    if (!process.browser) return;

    const {
      openSeaBaseUrl,
      contractConfig: { mainContractAddress },
    } = getNetworkConfig();
    if (!openSeaBaseUrl) return;

    return `${openSeaBaseUrl}/assets/${mainContractAddress}/${numericId}`;
  }, [numericId]);

  return (
    <Box textAlign="center" width="full">
      <Heading as="h1" size="4xl" fontSize={["2xl", "3xl", "4xl"]} mb={4}>
        {strings.title}
      </Heading>
      <Text>
        {strings.success}
        {selectedN.id}
      </Text>
      <Box maxWidth="400px" width="90%" marginX="auto" marginY={3}>
        <Box borderWidth="4px" borderColor="transparent" borderStyle="solid" width="full">
          <img src={svgContent ?? ""} alt={`n-pass #${selectedN.id}`} />
        </Box>
      </Box>

      {openSeaUrl && (
        <Flex justifyContent="center" marginTop={12}>
          <Link href={openSeaUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">{strings.viewOS}</Button>
          </Link>
        </Flex>
      )}

      <Box marginTop={8}>
        <Button onClick={handleDone}>{strings.done}</Button>
      </Box>
    </Box>
  );
};
