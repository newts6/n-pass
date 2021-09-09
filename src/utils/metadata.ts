export type DecodedNMetadata = {
  name: string
  description: string
  image: string
}

export function parseAndExtractImageFromURI(uri: string): string {
  const decoded: DecodedNMetadata = JSON.parse(atob(uri.substr(29)))
  return decoded.image
}
