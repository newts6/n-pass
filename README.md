# N Pass

## Intro

This is a start pack to build NFTs using the NPass from the n project.
It is thought to give you all the tools to build and deploy a "n" enabled NFT.

### Steps

1. `yarn install` (tested with yarn v1.22.11)
1. Create a subcontract which derives from NPass.sol [example](contracts/testing/MockNPass.sol)
   1. Decide if this only for n token holders. If yes, set the constructor argument `onlyNHolders` to true
1. Build you NFT custom logic/metadata
1. Customise [deployment script](deploy/01_N_PASS.ts)
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

To start the forked environmnet run:

`yarn fork`

To run your deployment scripts run (in a different shell):

`yarn deploy-fork`

If you need n token to be sent to a specific address you can use the following task:

```
Usage: hardhat [GLOBAL OPTIONS] transfer-n [--recipient <STRING>] [--tokens <STRING>]

OPTIONS:

  --recipient   Where to send n tokens (default: null)
  --tokens      Tokens to transfer (default: null)

transfer-n: Transfers n tokens to a recipient
```

for example this will transfer tokens #888 #1 and #69 to the address 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B

`yarn hardhat transfer-n --recipient 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B --tokens 888,1,69`

## Tools Usage

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
$ yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true yarn test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

### Deploy

Deploy the contracts to Hardhat Network:

```sh
$ yarn deploy
```

Deploy the contracts to a specific network, such as the Ropsten testnet:

```sh
$ yarn deploy:network ropsten
```

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

This is derived by https://github.com/paulrberg/solidity-template
Thanks Paul!
