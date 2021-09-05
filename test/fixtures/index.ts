import { deployments, getNamedAccounts, getUnnamedAccounts } from "hardhat";
import { NPass } from "../../typechain";
import { N } from "../../typechain/N";
import { setupUser, setupUsers } from "./users";

export interface Contracts {
  NDerivative: NPass;
  NDerivativeRestricted: NPass;
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
  const nDerivative = (await nPassFactory.deploy("ND", "ND", nAddress, false)) as NPass;
  const nDerivativeRestricted = (await nPassFactory.deploy("NDR", "NDR", nAddress, true)) as NPass;

  const contracts: Contracts = {
    NDerivative: nDerivative,
    NDerivativeRestricted: nDerivativeRestricted,
    N: nContract,
  };
  const users: User[] = await setupUsers(await getUnnamedAccounts(), contracts);

  return {
    contracts,
    deployer: <User>await setupUser(deployer, contracts),
    users,
  };
});
