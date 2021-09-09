export type Web3Error = {
  message?: string
  data?: {
    message?: string
  }
}

const ERROR_PARSERS: Array<RegExp> = [
  /with reason .*'(.+)'/,
  /MetaMask Tx Signature: (.+)\./,
  /(Nonce too high)/,
]

function parseRevertError(errorMessage: string): string | undefined {
  return ERROR_PARSERS
    .map(parser => errorMessage.match(parser)?.[1] ?? undefined)
    .find((result, index) => {
      console.log(index, result)
      return result
    })
}

export function parseWalletError(err: Web3Error): string | undefined {
  const errStr = err?.data?.message ?? err?.message
  return errStr ? parseRevertError(errStr) ?? errStr : undefined
}
