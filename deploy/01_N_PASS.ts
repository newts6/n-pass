import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("NPass", {
    //TODO Replace with your contract's name
    from: deployer,
    log: true,
    args: [], //TODO Replace with your contract's constructor args
  });
};
export default func;
func.tags = ["NPass"];
