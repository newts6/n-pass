/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from "chai";
import { ethers } from "hardhat";
import { NPass } from "../../typechain";
import { ETH, getEthBalance } from "../../utils/utils";
import { Contracts, setupIntegration as setupNDerivative, User } from "../fixtures";

const GAS_ADJ = ETH(0.01);

describe("NPass", function () {
  let contracts: Contracts;
  let deployer: User;
  let users: User[];

  beforeEach(async () => {
    ({ contracts, deployer, users } = await setupNDerivative());
  });

  describe("Construction", async function () {
    it("reverts on supply = 0", async function () {
      const nPassFactory = await ethers.getContractFactory("MockNPass");
      await expect(nPassFactory.deploy("ND", "ND", contracts.N.address, true, 0, 0, 0, 0)).to.be.revertedWith(
        "NPass:INVALID_SUPPLY",
      );
    });
    it("reverts on restricted minting with total supply > n supply", async function () {
      const nPassFactory = await ethers.getContractFactory("MockNPass");
      await expect(nPassFactory.deploy("ND", "ND", contracts.N.address, true, 10000, 0, 0, 0)).to.be.revertedWith(
        "NPass:INVALID_SUPPLY",
      );
    });

    it("reverts on minting with total supply < allowance", async function () {
      const nPassFactory = await ethers.getContractFactory("MockNPass");
      await expect(nPassFactory.deploy("ND", "ND", contracts.N.address, true, 100, 101, 0, 0)).to.be.revertedWith(
        "NPass:INVALID_ALLOWANCE",
      );
    });
  });

  describe("Unrestricted", async function () {
    it("allows only n owner to call mintWithN", async function () {
      await users[0].N.claim(2);
      expect(await contracts.N.ownerOf(2)).to.be.equals(users[0].address);
      await expect(deployer.NDerivative.mintWithN(2)).to.be.revertedWith("NPass:INVALID_OWNER");
      await users[0].NDerivative.mintWithN(2);
      expect(await contracts.NDerivative.ownerOf(2)).to.be.equals(users[0].address);
    });

    it("forbids non n holder to mint inside n token ids range", async function () {
      await users[0].N.claim(8888);
      await expect(deployer.NDerivative.mint(8888)).to.be.revertedWith("NPass:INVALID_ID");
    });

    it("allows anyone to mint out of n token ids range with unrestricted pass", async function () {
      await deployer.NDerivative.mint(9999);
      expect(await contracts.NDerivative.ownerOf(9999)).to.be.equals(deployer.address);
    });
  });

  describe("Restricted", async function () {
    it("does not allow anyone to mint inside n token ids range with unrestricted pass", async function () {
      await users[0].N.claim(1000);
      // Different user trying to mint
      await expect(deployer.NDerivativeRestricted.mint(1000)).to.be.revertedWith("NPass:OPEN_MINTING_DISABLED");
    });

    it("allows none to mint out of n token ids range with restricted pass", async function () {
      await expect(deployer.NDerivativeRestricted.mint(9999)).to.be.revertedWith("NPass:OPEN_MINTING_DISABLED");
    });
  });

  describe("With Allowance", async function () {
    it("allows n minting when allowance available", async function () {
      await deployer.N.claim(2);
      expect(await contracts.N.ownerOf(2)).to.be.equals(deployer.address);
      await deployer.NDerivativeWithAllowance.mintWithN(2);
      expect(await contracts.NDerivativeWithAllowance.ownerOf(2)).to.be.equals(deployer.address);
    });

    it("allows open minting when allowance available", async function () {
      await deployer.NDerivativeWithAllowance.mint(8889);
      expect(await contracts.NDerivativeWithAllowance.ownerOf(8889)).to.be.equals(deployer.address);
    });

    it("allows n minting up to the allowance", async function () {
      const allowance = await contracts.NDerivativeWithAllowance.reservedAllowance();
      for (let i = 0; i < allowance; i++) {
        const tokenId = i + 1;
        await deployer.N.claim(tokenId);
        expect(await contracts.N.ownerOf(tokenId)).to.be.equals(deployer.address);
        await deployer.NDerivativeWithAllowance.mintWithN(tokenId);
        expect(await contracts.NDerivativeWithAllowance.ownerOf(tokenId)).to.be.equals(deployer.address);
      }

      await expect(deployer.NDerivativeWithAllowance.mintWithN(allowance)).to.be.revertedWith(
        "NPass:MAX_ALLOCATION_REACHED",
      );
    });

    it("allows open minting up to the max total supply respecting allowance", async function () {
      const allowance = await contracts.NDerivativeWithAllowance.reservedAllowance();
      const maxTotalSupply = (await contracts.NDerivativeWithAllowance.maxTotalSupply()).toNumber();
      const openMints = maxTotalSupply - allowance;
      for (let i = 0; i < openMints; i++) {
        const tokenId = 8889 + i;
        await deployer.NDerivativeWithAllowance.mint(tokenId);
        expect(await contracts.NDerivativeWithAllowance.ownerOf(tokenId)).to.be.equals(deployer.address);
      }
      await expect(deployer.NDerivativeWithAllowance.mint(8889 + openMints)).to.be.revertedWith(
        "NPass:MAX_ALLOCATION_REACHED",
      );
    });

    it("allows open minting up to the max total supply respecting allowance for n token holders", async function () {
      const allowance = await contracts.NDerivativeWithAllowance.reservedAllowance();
      const maxTotalSupply = (await contracts.NDerivativeWithAllowance.maxTotalSupply()).toNumber();
      const openMints = maxTotalSupply - allowance;
      for (let i = 0; i < openMints; i++) {
        const tokenId = i + 1;
        await deployer.N.claim(tokenId);
        expect(await contracts.N.ownerOf(tokenId)).to.be.equals(deployer.address);
        await deployer.NDerivativeWithAllowance.mint(tokenId);
        expect(await contracts.NDerivativeWithAllowance.ownerOf(tokenId)).to.be.equals(deployer.address);
      }
      await deployer.N.claim(openMints + 1);
      await expect(deployer.NDerivativeWithAllowance.mint(openMints + 1)).to.be.revertedWith(
        "NPass:MAX_ALLOCATION_REACHED",
      );
    });

    it("allows all minting up to the max total supply respecting allowance", async function () {
      const allowance = await contracts.NDerivativeWithAllowance.reservedAllowance();
      const maxTotalSupply = (await contracts.NDerivativeWithAllowance.maxTotalSupply()).toNumber();
      const openMints = maxTotalSupply - allowance;
      for (let i = 0; i < allowance; i++) {
        const tokenId = i + 1;
        await deployer.N.claim(tokenId);
        await deployer.NDerivativeWithAllowance.mintWithN(tokenId);
      }
      for (let i = 0; i < openMints; i++) {
        const tokenId = 8889 + i;
        await deployer.NDerivativeWithAllowance.mint(tokenId);
      }
      await expect(deployer.NDerivativeWithAllowance.mintWithN(allowance)).to.be.revertedWith(
        "NPass:MAX_ALLOCATION_REACHED",
      );
      await expect(deployer.NDerivativeWithAllowance.mint(8889 + openMints)).to.be.revertedWith(
        "NPass:MAX_ALLOCATION_REACHED",
      );
      expect(await contracts.NDerivativeWithAllowance.totalSupply()).to.be.equals(maxTotalSupply);
    });

    it("forbids open minting when total supply=1 and allowance=1", async function () {
      const nPassFactory = await ethers.getContractFactory("MockNPass");
      const nDerivative = (await nPassFactory.deploy("ND", "ND", contracts.N.address, false, 1, 1, 0, 0)) as NPass;
      await expect(nDerivative.mint(9999)).to.be.revertedWith("NPass:MAX_ALLOCATION_REACHED");
    });

    it("allows n minting when total supply=1 and allowance=1", async function () {
      await deployer.N.claim(1);
      await deployer.N.claim(2);
      const nPassFactory = await ethers.getContractFactory("MockNPass");
      const nDerivative = (await nPassFactory.deploy("ND", "ND", contracts.N.address, false, 1, 1, 0, 0)) as NPass;
      await nDerivative.mintWithN(1);
      expect(await nDerivative.ownerOf(1)).to.be.equals(deployer.address);
      await expect(nDerivative.mintWithN(2)).to.be.revertedWith("NPass:MAX_ALLOCATION_REACHED");
    });

    it("allows open minting when total supply=1 and allowance=0", async function () {
      const nPassFactory = await ethers.getContractFactory("MockNPass");
      const nDerivative = (await nPassFactory.deploy("ND", "ND", contracts.N.address, false, 1, 0, 0, 0)) as NPass;
      await nDerivative.mint(8889);
      expect(await nDerivative.ownerOf(8889)).to.be.equals(deployer.address);
    });

    it("forbids open minting with token id beyond range", async function () {
      const nPassFactory = await ethers.getContractFactory("MockNPass");
      const totalSupply = 100;
      const nDerivative = (await nPassFactory.deploy(
        "ND",
        "ND",
        contracts.N.address,
        false,
        totalSupply,
        0,
        0,
        0,
      )) as NPass;
      const lastAllowedTokenId = 8888 + totalSupply;
      await nDerivative.mint(lastAllowedTokenId);
      expect(await nDerivative.ownerOf(lastAllowedTokenId)).to.be.equals(deployer.address);
      // We could have a more meaningful revert but this does the job
      await expect(nDerivative.mint(lastAllowedTokenId + 1)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token",
      );
    });
  });

  describe("Price", async function () {
    it("requires n token holder to pay correct amount", async function () {
      await deployer.N.claim(1000);
      const price = await contracts.NDerivativeWithPrice.priceForNHoldersInWei();
      await expect(deployer.NDerivativeWithPrice.mintWithN(1000, { value: price.sub(1) })).to.be.revertedWith(
        "NPass:INVALID_PRICE",
      );
      await expect(deployer.NDerivativeWithPrice.mintWithN(1000, { value: price.add(1) })).to.be.revertedWith(
        "NPass:INVALID_PRICE",
      );
      await deployer.NDerivativeWithPrice.mintWithN(1000, { value: price });
      expect(await contracts.NDerivativeWithPrice.ownerOf(1000)).to.be.equals(deployer.address);
    });

    it("requires open minter to pay correct amount", async function () {
      const price = await contracts.NDerivativeWithPrice.priceForOpenMintInWei();
      await expect(deployer.NDerivativeWithPrice.mint(10000, { value: price.sub(1) })).to.be.revertedWith(
        "NPass:INVALID_PRICE",
      );
      await expect(deployer.NDerivativeWithPrice.mint(10000, { value: price.add(1) })).to.be.revertedWith(
        "NPass:INVALID_PRICE",
      );
      await deployer.NDerivativeWithPrice.mint(10000, { value: price });
      expect(await contracts.NDerivativeWithPrice.ownerOf(10000)).to.be.equals(deployer.address);
    });

    it("allows owner to withdraw", async function () {
      const price = await contracts.NDerivativeWithPrice.priceForOpenMintInWei();
      await users[0].NDerivativeWithPrice.mint(10000, { value: price });
      await users[0].NDerivativeWithPrice.mint(10001, { value: price });
      const initialBalance = await getEthBalance(deployer.address);
      await deployer.NDerivativeWithPrice.withdrawAll();
      expect(await getEthBalance(deployer.address)).to.be.gte(initialBalance.add(price.mul(2)).sub(GAS_ADJ));
    });

    it("forbids non owner to withdraw", async function () {
      const price = await contracts.NDerivativeWithPrice.priceForOpenMintInWei();
      await users[0].NDerivativeWithPrice.mint(10000, { value: price });
      await users[0].NDerivativeWithPrice.mint(10001, { value: price });
      await expect(users[0].NDerivativeWithPrice.withdrawAll()).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Multi mint", async function () {
    it("allows to mint multiple owned tokens", async function () {
      await deployer.N.claim(1);
      await deployer.N.claim(2);
      await deployer.N.claim(3);
      expect(await contracts.N.ownerOf(1)).to.be.equals(deployer.address);
      expect(await contracts.N.ownerOf(2)).to.be.equals(deployer.address);
      expect(await contracts.N.ownerOf(3)).to.be.equals(deployer.address);
      await deployer.NDerivative.multiMintWithN([1, 2, 3]);
      expect(await contracts.NDerivative.ownerOf(1)).to.be.equals(deployer.address);
      expect(await contracts.NDerivative.ownerOf(2)).to.be.equals(deployer.address);
      expect(await contracts.NDerivative.ownerOf(3)).to.be.equals(deployer.address);
    });

    it("allows to mint multiple owned tokens with price", async function () {
      await deployer.N.claim(1);
      await deployer.N.claim(2);
      await deployer.N.claim(3);
      expect(await contracts.N.ownerOf(1)).to.be.equals(deployer.address);
      expect(await contracts.N.ownerOf(2)).to.be.equals(deployer.address);
      expect(await contracts.N.ownerOf(3)).to.be.equals(deployer.address);
      const price = await contracts.NDerivativeWithPrice.priceForNHoldersInWei();
      await deployer.NDerivativeWithPrice.multiMintWithN([1, 2, 3], { value: price.mul(3) });
      expect(await contracts.NDerivativeWithPrice.ownerOf(1)).to.be.equals(deployer.address);
      expect(await contracts.NDerivativeWithPrice.ownerOf(2)).to.be.equals(deployer.address);
      expect(await contracts.NDerivativeWithPrice.ownerOf(3)).to.be.equals(deployer.address);
    });

    it("reverts multi mint if one token not owned", async function () {
      await deployer.N.claim(1);
      await deployer.N.claim(2);
      await users[0].N.claim(3);
      expect(await contracts.N.ownerOf(1)).to.be.equals(deployer.address);
      expect(await contracts.N.ownerOf(2)).to.be.equals(deployer.address);
      await expect(deployer.NDerivative.multiMintWithN([1, 2, 3])).to.be.revertedWith("NPass:INVALID_OWNER");
    });

    it("reverts multi mint if goes above total supply", async function () {
      await expect(deployer.NDerivativeWithAllowance.multiMintWithN([1, 2, 3, 4, 5, 6])).to.be.revertedWith(
        "NPass:MAX_ALLOCATION_REACHED",
      );
    });
    it("reverts multi mint if price wrong", async function () {
      const price = await contracts.NDerivativeWithPrice.priceForNHoldersInWei();
      await expect(
        deployer.NDerivativeWithPrice.multiMintWithN([1, 2, 3, 4, 5], { value: price.mul(3) }),
      ).to.be.revertedWith("NPass:INVALID_PRICE");
    });
  });

  describe('Events', async () => {
    it("Mint should emit a Mint Event", async () => {
      await expect(deployer.NDerivative.mint(9999))
        .to.emit(deployer.NDerivative, 'Minted')
        .withArgs(deployer.address, "9999");
    });

    it("Multiple Mint should emit a multiple Mint Events", async function () {
      await deployer.N.claim(1);
      await deployer.N.claim(2);
      await deployer.N.claim(3);
      await expect(deployer.NDerivative.multiMintWithN([1, 2, 3]))
        .to.emit(deployer.NDerivative, 'Minted').withArgs(deployer.address, "1")
        .to.emit(deployer.NDerivative, 'Minted').withArgs(deployer.address, "2")
        .to.emit(deployer.NDerivative, 'Minted').withArgs(deployer.address, "3");
    });

  });
});
