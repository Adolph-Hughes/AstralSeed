const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("RestakeVault", function () {
  let bioNFT, restakeVault, mintGateway;
  let owner, gateway, user1, user2;
  const rewardRate = ethers.parseEther("0.0001"); // 0.0001 ETH per second
  const bioHash1 = ethers.keccak256(ethers.toUtf8Bytes("sample-dna-1"));
  const bioHash2 = ethers.keccak256(ethers.toUtf8Bytes("sample-dna-2"));

  beforeEach(async function () {
    [owner, gateway, user1, user2] = await ethers.getSigners();

    // Deploy BioNFT
    const BioNFT = await ethers.getContractFactory("BioNFT");
    bioNFT = await BioNFT.deploy();
    await bioNFT.waitForDeployment();
    await bioNFT.setMintGateway(gateway.address);

    // Deploy RestakeVault
    const RestakeVault = await ethers.getContractFactory("RestakeVault");
    restakeVault = await RestakeVault.deploy(await bioNFT.getAddress(), rewardRate);
    await restakeVault.waitForDeployment();

    // Mint test NFTs
    await bioNFT.connect(gateway).mint(user1.address, bioHash1, 1, "ipfs://meta1");
    await bioNFT.connect(gateway).mint(user2.address, bioHash2, 1, "ipfs://meta2");

    // Fund rewards pool
    await restakeVault.depositRewards({ value: ethers.parseEther("10") });
  });

  describe("Staking", function () {
    it("Should stake a BioNFT", async function () {
      await bioNFT.connect(user1).approve(await restakeVault.getAddress(), 1);

      await expect(restakeVault.connect(user1).stake(1))
        .to.emit(restakeVault, "Staked");

      expect(await restakeVault.isStaked(1)).to.be.true;
      expect(await bioNFT.ownerOf(1)).to.equal(await restakeVault.getAddress());
    });

    it("Should fail to stake if not token owner", async function () {
      await expect(
        restakeVault.connect(user2).stake(1)
      ).to.be.revertedWith("Not token owner");
    });

    it("Should fail to stake already staked token", async function () {
      await bioNFT.connect(user1).approve(await restakeVault.getAddress(), 1);
      await restakeVault.connect(user1).stake(1);

      await expect(
        restakeVault.connect(user1).stake(1)
      ).to.be.revertedWith("Already staked");
    });

    it("Should track multiple staked tokens", async function () {
      await bioNFT.connect(user1).approve(await restakeVault.getAddress(), 1);
      await bioNFT.connect(user2).approve(await restakeVault.getAddress(), 2);

      await restakeVault.connect(user1).stake(1);
      await restakeVault.connect(user2).stake(2);

      const user1Tokens = await restakeVault.getStakedTokens(user1.address);
      const user2Tokens = await restakeVault.getStakedTokens(user2.address);

      expect(user1Tokens.length).to.equal(1);
      expect(user2Tokens.length).to.equal(1);
      expect(user1Tokens[0]).to.equal(1);
      expect(user2Tokens[0]).to.equal(2);
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      await bioNFT.connect(user1).approve(await restakeVault.getAddress(), 1);
      await restakeVault.connect(user1).stake(1);
    });

    it("Should unstake a BioNFT", async function () {
      await expect(restakeVault.connect(user1).unstake(1))
        .to.emit(restakeVault, "Unstaked");

      expect(await restakeVault.isStaked(1)).to.be.false;
      expect(await bioNFT.ownerOf(1)).to.equal(user1.address);
    });

    it("Should fail to unstake if not staker", async function () {
      await expect(
        restakeVault.connect(user2).unstake(1)
      ).to.be.revertedWith("Not your stake");
    });

    it("Should claim rewards on unstake", async function () {
      // Wait 100 seconds
      await time.increase(100);

      const initialBalance = await ethers.provider.getBalance(user1.address);
      const tx = await restakeVault.connect(user1).unstake(1);
      const receipt = await tx.wait();

      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const finalBalance = await ethers.provider.getBalance(user1.address);

      const expectedRewards = rewardRate * 100n;
      const actualRewards = finalBalance + gasUsed - initialBalance;

      expect(actualRewards).to.be.closeTo(expectedRewards, ethers.parseEther("0.001"));
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      await bioNFT.connect(user1).approve(await restakeVault.getAddress(), 1);
      await restakeVault.connect(user1).stake(1);
    });

    it("Should calculate pending rewards correctly", async function () {
      await time.increase(100);

      const pending = await restakeVault.pendingRewards(user1.address);
      const expected = rewardRate * 100n;

      expect(pending).to.be.closeTo(expected, ethers.parseEther("0.001"));
    });

    it("Should claim accumulated rewards", async function () {
      await time.increase(100);

      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      await expect(restakeVault.connect(user1).claimRewards())
        .to.emit(restakeVault, "RewardsClaimed");

      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should accumulate rewards over time", async function () {
      await time.increase(50);
      const pending1 = await restakeVault.pendingRewards(user1.address);

      await time.increase(50);
      const pending2 = await restakeVault.pendingRewards(user1.address);

      expect(pending2).to.be.gt(pending1);
    });

    it("Should distribute rewards proportionally for multiple stakers", async function () {
      // User2 stakes after 50 seconds
      await time.increase(50);
      await bioNFT.connect(user2).approve(await restakeVault.getAddress(), 2);
      await restakeVault.connect(user2).stake(2);

      // Wait another 50 seconds
      await time.increase(50);

      const pending1 = await restakeVault.pendingRewards(user1.address);
      const pending2 = await restakeVault.pendingRewards(user2.address);

      // User1 should have ~100 seconds worth
      const expected1 = rewardRate * 100n;
      // User2 should have ~50 seconds worth
      const expected2 = rewardRate * 50n;

      expect(pending1).to.be.closeTo(expected1, ethers.parseEther("0.001"));
      expect(pending2).to.be.closeTo(expected2, ethers.parseEther("0.001"));
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to update reward rate", async function () {
      const newRate = ethers.parseEther("0.0002");
      await restakeVault.setRewardRate(newRate);
      expect(await restakeVault.rewardRate()).to.equal(newRate);
    });

    it("Should allow owner to deposit rewards", async function () {
      const amount = ethers.parseEther("5");
      await restakeVault.depositRewards({ value: amount });
      
      expect(await restakeVault.getRewardsPool()).to.be.gte(amount);
    });

    it("Should allow owner emergency withdraw", async function () {
      const amount = ethers.parseEther("1");
      await restakeVault.emergencyWithdraw(amount);
      
      // Verify funds were withdrawn (check contract balance decreased)
    });

    it("Should fail if non-owner tries to configure", async function () {
      await expect(
        restakeVault.connect(user1).setRewardRate(rewardRate)
      ).to.be.reverted;

      await expect(
        restakeVault.connect(user1).emergencyWithdraw(ethers.parseEther("1"))
      ).to.be.reverted;
    });
  });

  describe("Stake Info", function () {
    it("Should return correct stake information", async function () {
      await bioNFT.connect(user1).approve(await restakeVault.getAddress(), 1);
      await restakeVault.connect(user1).stake(1);

      const [staker, stakedAt] = await restakeVault.getStakeInfo(1);

      expect(staker).to.equal(user1.address);
      expect(stakedAt).to.be.gt(0);
    });

    it("Should return empty info for unstaked token", async function () {
      const [staker, stakedAt] = await restakeVault.getStakeInfo(1);

      expect(staker).to.equal(ethers.ZeroAddress);
      expect(stakedAt).to.equal(0);
    });
  });
});

