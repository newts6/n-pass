import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("NDerivative", {
    //TODO Replace with your contract's name
    from: deployer,
    log: true,
    args: ["0x05a46f1E545526FB803FF974C790aCeA34D1f2D6"], //TODO Replace with your contract's constructor args
  });
};
export default func;
func.tags = ["NDerivative"];
