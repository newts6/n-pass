import dynamic from "next/dynamic"
import { NCardProps } from "./props"

const DynamicComponentWithNoSSR = dynamic(() => import("./NCard"), {
  ssr: false,
})

const LazyNCard = (props: NCardProps) => <DynamicComponentWithNoSSR {...props}/>

export default LazyNCard
