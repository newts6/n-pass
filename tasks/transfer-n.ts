import { BigNumber, Contract, Signer } from "ethers";
import { task, types } from "hardhat/config";
import { IERC721Enumerable } from "./dependencies/IERC721Enumerable";
import { TASK_TRANSFER_N } from "./task-names";
import ERC721ABI from "./dependencies/IERC721.json";

task(TASK_TRANSFER_N, "Transfers n tokens to a recipient")
  .addParam("recipient", "Where to send n tokens", null, types.string)
  .addParam("tokens", "Tokens to transfer", null, types.string)
  .setAction(async ({ tokens, recipient }, hre): Promise<void> => {
    const { ethers } = hre;

    async function sudo(sudoUser: string, block: (signer: Signer) => Promise<unknown>) {
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [sudoUser],
      });

      const signer = await ethers.provider.getSigner(sudoUser);
      await block(signer);
    }

    async function sudo_TransferERC721(
      tokenAddress: string,
      owner: string,
      id: BigNumber,
      recipient: string,
    ): Promise<void> {
      return sudo(owner, (signer: Signer) => {
        const tokenContract = new Contract(tokenAddress, ERC721ABI.abi, signer) as IERC721Enumerable;
        return tokenContract.transferFrom(owner, recipient, id);
      });
    }

    const nContract = (await ethers.getContractAt(
      "IERC721Enumerable",
      "0x05a46f1E545526FB803FF974C790aCeA34D1f2D6",
    )) as IERC721Enumerable;

    const recipientAddress = ethers.utils.getAddress(recipient);
    const tokenIds = tokens.split(",");
    console.log(`Transferring tokens ${tokenIds} to ${recipientAddress}`);

    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      const owner = await nContract.ownerOf(tokenId);
      console.log("Transferring n token: ", tokenId);
      await sudo_TransferERC721(nContract.address, owner, tokenId, recipientAddress);
      console.log(`Owner of n #${tokenId}: `, await nContract.ownerOf(tokenId));
    }
  });
