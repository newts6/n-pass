/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from "chai";
import { Contracts, setupIntegration as setupNDerivative, User } from "../fixtures";

describe("NPass", function () {
  let contracts: Contracts;
  let deployer: User;
  let users: User[];

  beforeEach(async () => {
    ({ contracts, deployer, users } = await setupNDerivative());
  });

  describe("Minting", async function () {
    it("allows only n owner to call mintWithN", async function () {
      await users[0].N.claim(2);
      expect(await contracts.N.ownerOf(2)).to.be.equals(users[0].address);
      await expect(deployer.NDerivative.mintWithN(2)).to.be.revertedWith("NPass:INVALID_OWNER");
    });
  });

  it("allows anyone to mint out of n token ids range with unrestricted pass", async function () {
    await deployer.NDerivative.mint(9999);
    expect(await contracts.NDerivative.ownerOf(9999)).to.be.equals(deployer.address);
  });
  it("does not allow anyone to mint inside n token ids range with unrestricted pass", async function () {
    await users[0].N.claim(1000);
    // Different user trying to mint
    await expect(deployer.NDerivativeRestricted.mint(1000)).to.be.revertedWith("NPass:OPEN_MINTING_DISABLED");
  });

  it("allows none to mint out of n token ids range with restricted pass", async function () {
    await expect(deployer.NDerivativeRestricted.mint(9999)).to.be.revertedWith("NPass:OPEN_MINTING_DISABLED");
  });
});
