import { deployments, getNamedAccounts, getUnnamedAccounts } from "hardhat";
import { NPass } from "../../typechain";
import { N } from "../../typechain/N";
import { ETH } from "../../utils/utils";
import { setupUser, setupUsers } from "./users";

export interface Contracts {
  NDerivative: NPass;
  NDerivativeRestricted: NPass;
  NDerivativeWithAllowance: NPass;
  NDerivativeWithPrice: NPass;
  N: N;
}

export interface User extends Contracts {
  address: string;
}

export const setupIntegration = deployments.createFixture(async ({ ethers }) => {
  const { deployer } = await getNamedAccounts();

  const nContractFactory = await ethers.getContractFactory("N");
  const nContract = (await nContractFactory.deploy()) as N;
  const nAddress = nContract.address;

  const nPassFactory = await ethers.getContractFactory("MockNPass");
  const nDerivative = (await nPassFactory.deploy("ND", "ND", nAddress, false, 8888, 0, 0, 0)) as NPass;
  const nDerivativeRestricted = (await nPassFactory.deploy("NDR", "NDR", nAddress, true, 8888, 0, 0, 0)) as NPass;
  const nDerivativeWithAllowance = (await nPassFactory.deploy("NDA", "NDA", nAddress, false, 10, 5, 0, 0)) as NPass;
  const nDerivativeWithPrice = (await nPassFactory.deploy(
    "ND",
    "ND",
    nAddress,
    false,
    8888,
    0,
    ETH(1),
    ETH(5),
  )) as NPass;

  const contracts: Contracts = {
    NDerivative: nDerivative,
    NDerivativeRestricted: nDerivativeRestricted,
    NDerivativeWithAllowance: nDerivativeWithAllowance,
    NDerivativeWithPrice: nDerivativeWithPrice,
    N: nContract,
  };
  const users: User[] = await setupUsers(await getUnnamedAccounts(), contracts);

  return {
    contracts,
    deployer: <User>await setupUser(deployer, contracts),
    users,
  };
});
