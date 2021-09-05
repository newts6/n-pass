import { Contract } from "ethers";
import { ethers, getNamedAccounts } from "hardhat";

//TODO fix typing
export async function setupUsers<U>(addresses: string[], contracts: unknown): Promise<U[]> {
  const users: U[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users;
}

export async function setupUser<U>(address: string, unsafeContracts: unknown): Promise<U> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = { address };
  const contracts = unsafeContracts as { [contractName: string]: Contract };

  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address));
  }
  return user as U;
}

export async function setupDeployer<U>(unsafeContracts: unknown): Promise<U> {
  const { deployer } = await getNamedAccounts();
  return await setupUser(deployer, unsafeContracts);
}
