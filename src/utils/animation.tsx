import { Grid, GridItem } from "@chakra-ui/react"
import { motion } from "framer-motion"

export const MotionGrid = motion(Grid)
export const MotionGridItem = motion(GridItem)

export const GRID_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1, y: 0, transition: {
      staggerChildren: 0.04,
      delayChildren: 0,
      ease: "easeOut",
      duration: .7,
    },
  },
}
