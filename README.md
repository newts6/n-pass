# N Pass

## Intro

This is a start pack to build NFTs using the NPass from the n project.
It is thought to give you all the tools to build and deploy a "n" enabled NFT.
Throughout the codebase there are `TODO` comments which help customise your code (use the find function to find them)

## Smart Contracts

Smart contract are written in Solidity and managed via hardhat.

### Steps

1. `yarn install` (tested with yarn v1.22.11)
1. Create a subcontract which derives from NPass.sol [example](contracts/testing/MockNPass.sol)
   1. Decide if this only for n token holders. If yes, set the constructor argument `onlyNHolders` to true
1. Build you NFT custom logic/metadata
1. Customise [deployment script](deploy/01_deploy_derivative.ts)
1. Set up a .env file with the relevant variables [example](./.env.example)
1. deploy running command `yarn hardhat --network mainnet deploy --gasprice "170000000000"`
1. deploy etherscan verification `yarn hardhat --network mainnet etherscan-verify`

## N Pass Configuration

### onlyNHolders

If set to true this will allow only token holders to mint. Based on other parameters this could mean either all n token holders
have the right to mint or just a subset.

### maxTotalSupply

Maximum number of tokens that can ever be minted.

### reservedAllowance

Number of tokens reserved for n token holders. This can be less than the total number of n tokens (8888), in which case will
enact a first come first serve mechanism for n token holders too.

### priceForNHoldersInWei

Price n token holders need to pay to mint.

### priceForOpenMintInWei

Price open minter need to pay to mint.

## Testing Locally

If you want to test your contract locally this template provides forked mainnet capabilities out of the box. In this way you will be able to test directly against the real n token contract as it is in mainnet.

To start the forked environment run:

`yarn fork`

When launched you will have a forked blockchain running at `http://127.0.0.1:8545/` so you can point you web3 provider (e.g. Metamask select network localhost:8545).
To use this network you need to create a wallet using the seed in your ./.env file. The first 10 accounts from this seed will have 1000 ETH each.

To run your deployment scripts run (in a different shell):

`yarn deploy:fork`

If you need n token to be sent to a specific address you can use the following task:

```
Usage: hardhat [GLOBAL OPTIONS] transfer-n [--recipient <STRING>] [--tokens <STRING>]

OPTIONS:

  --recipient   Where to send n tokens (default: null)
  --tokens      Tokens to transfer (default: null)

transfer-n: Transfers n tokens to a recipient
```

for example this will transfer tokens #888 #1 and #69 to the address 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B

`yarn hardhat --network localhost transfer-n --recipient 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B --tokens 888,1,69`

# Tools Reference

- [Hardhat](https://hardhat.org/getting-started/)
- [Ethers.js](https://docs.ethers.io/v5/)
- [hardhat-deploy](https://github.com/wighawag/hardhat-deploy/tree/master#-hardhat-deploy)

## Syntax Highlighting

If you use VSCode, you can enjoy syntax highlighting for your Solidity code via the
[vscode-solidity](https://github.com/juanfranblanco/vscode-solidity) extension. The recommended approach to set the
compiler version is to add the following fields to your VSCode user settings:

```json
{
  "solidity.compileUsingRemoteVersion": "v0.8.4+commit.c7e474f2",
  "solidity.defaultCompiler": "remote"
}
```

Where of course `v0.8.4+commit.c7e474f2` can be replaced with any other version.

## Credits

This contracts part is derived from https://github.com/paulrberg/solidity-template
Thanks Paul!

## Frontend

The frontend is written TS/React/Next.js, it represents a minimalistic yet UX/UI pleasing template for allowing minting of derivative tokens.

Special attention needs to be given to the [network files](./networks) which need to be customised with the address of your contract and/or the n contract if you deploy a copy of it in testnet.
When you use a forked mainnet you need to change the `mainnet->mainContractAddress` in [this file](./networks/networks.json).

### Steps

### Install dependencies

1. `yarn install` (if not done)

1. Run the development server `yarn dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.tsx`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Localization

Each file with user facing strings can be localized by adding the relative language configuration.

For instance to add french to the selection page, add:

```
  fr: {
    select: "Sélectionnez un N",
    noN: "Vous ne possédez aucun N. Vous pouvez en acheter un sur OpenSea.",
    buyN: "Achetez-en un",
  },
```

in the strings JSON.

## Tools Reference

- [Next.js](https://nextjs.org/docs/)
- [React](https://reactjs.org/docs/getting-started.html)
- [react-localization](https://www.npmjs.com/package/react-localization)

## Credits

The frontend is forked from https://github.com/knav-eth/runes
Thanks Knav!
