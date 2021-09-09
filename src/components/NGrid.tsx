import { Box, Tooltip } from "@chakra-ui/react";
import React from "react";
import { SubgraphN } from "../clients/n";
import { NWithAvailability } from "../hooks/useOwnedNs";
import { GRID_ANIMATION_VARIANTS, MotionGrid, MotionGridItem } from "../utils/animation";
import NCard from "./NCard";

export type NGridProps = {
  ns: Array<NWithAvailability>;
  onClick?: (n: SubgraphN) => void;
};

const NGrid: React.FC<NGridProps> = ({ ns, onClick }) => {
  return (
    <MotionGrid
      flex={1}
      templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)"]}
      gap={4}
      maxW="930px"
      marginX="auto"
      marginY="52px"
      variants={GRID_ANIMATION_VARIANTS}
      initial={"hidden"}
      animate={"show"}
    >
      {ns.map(({ n, available }) => {
        const numericId = parseInt(n.id);
        return (
          <MotionGridItem
            key={numericId}
            display="flex"
            cursor={available ? "pointer" : "not-allowed"}
            variants={GRID_ANIMATION_VARIANTS}
            whileHover={available ? { scale: 1.05 } : undefined}
            onTap={() => {
              if (available) {
                onClick?.(n);
              }
            }}
          >
            <Tooltip label={available ? undefined : "This N has already been used"}>
              <Box
                opacity={available ? undefined : 0.5}
                backgroundColor="gray.800"
                borderWidth="4px"
                borderColor="transparent"
                borderStyle="solid"
                width="full"
              >
                <NCard n={n} />
              </Box>
            </Tooltip>
          </MotionGridItem>
        );
      })}
    </MotionGrid>
  );
};

export default NGrid;
