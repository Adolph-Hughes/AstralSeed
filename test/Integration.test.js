const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Integration Tests", function () {
  let institutionRegistry, bioNFT, mintGateway, restakeVault, licenseManager, revenueSplitter, metadataVault;
  let owner, institution, user1, user2, protocol;
  const bioHash1 = ethers.keccak256(ethers.toUtf8Bytes("dna-sample-1"));
  const bioHash2 = ethers.keccak256(ethers.toUtf8Bytes("dna-sample-2"));

  beforeEach(async function () {
    [owner, institution, user1, user2, protocol] = await ethers.getSigners();

    // Deploy all contracts
    const InstitutionRegistry = await ethers.getContractFactory("InstitutionRegistry");
    institutionRegistry = await InstitutionRegistry.deploy();
    await institutionRegistry.waitForDeployment();

    const BioNFT = await ethers.getContractFactory("BioNFT");
    bioNFT = await BioNFT.deploy();
    await bioNFT.waitForDeployment();

    const MintGateway = await ethers.getContractFactory("MintGateway");
    mintGateway = await MintGateway.deploy(
      await bioNFT.getAddress(),
      await institutionRegistry.getAddress()
    );
    await mintGateway.waitForDeployment();

    await bioNFT.setMintGateway(await mintGateway.getAddress());

    const RestakeVault = await ethers.getContractFactory("RestakeVault");
    restakeVault = await RestakeVault.deploy(
      await bioNFT.getAddress(),
      ethers.parseEther("0.0001")
    );
    await restakeVault.waitForDeployment();

    const RevenueSplitter = await ethers.getContractFactory("RevenueSplitter");
    revenueSplitter = await RevenueSplitter.deploy(
      await bioNFT.getAddress(),
      await institutionRegistry.getAddress(),
      protocol.address
    );
    await revenueSplitter.waitForDeployment();

    const LicenseManager = await ethers.getContractFactory("LicenseManager");
    licenseManager = await LicenseManager.deploy(
      await bioNFT.getAddress(),
      await revenueSplitter.getAddress()
    );
    await licenseManager.waitForDeployment();

    const MetadataVault = await ethers.getContractFactory("MetadataVault");
    metadataVault = await MetadataVault.deploy(await bioNFT.getAddress());
    await metadataVault.waitForDeployment();

    // Setup
    const REGISTRAR_ROLE = await institutionRegistry.REGISTRAR_ROLE();
    await institutionRegistry.grantRole(REGISTRAR_ROLE, owner.address);
    await institutionRegistry.registerInstitution(institution.address, "Lab", "metadata");
    
    await restakeVault.depositRewards({ value: ethers.parseEther("10") });
  });

  describe("Complete User Journey", function () {
    it("Should support full workflow: mint -> store metadata -> stake -> license", async function () {
      // 1. Mint bio-NFT
      const nonce = ethers.randomBytes(32);
      const messageHash = ethers.solidityPackedKeccak256(
        ["bytes32", "uint256", "address", "bytes32"],
        [bioHash1, 1, user1.address, nonce]
      );
      const signature = await institution.signMessage(ethers.getBytes(messageHash));

      await mintGateway.connect(user1).mintBioNFT(
        bioHash1,
        1,
        "ipfs://metadata1",
        nonce,
        signature
      );

      expect(await bioNFT.ownerOf(1)).to.equal(user1.address);

      // 2. Store encrypted metadata
      await metadataVault.connect(user1).storeMetadata(
        1,
        "QmExampleCID",
        ethers.hexlify(ethers.randomBytes(32))
      );

      expect(await metadataVault.metadataExists(1)).to.be.true;

      // 3. Stake NFT
      await bioNFT.connect(user1).approve(await restakeVault.getAddress(), 1);
      await restakeVault.connect(user1).stake(1);

      expect(await restakeVault.isStaked(1)).to.be.true;

      // 4. Wait and accumulate rewards
      await time.increase(100);

      const pendingRewards = await restakeVault.pendingRewards(user1.address);
      expect(pendingRewards).to.be.gt(0);

      // 5. Unstake
      await restakeVault.connect(user1).unstake(1);

      expect(await bioNFT.ownerOf(1)).to.equal(user1.address);
      expect(await restakeVault.isStaked(1)).to.be.false;

      // 6. Issue license
      const licensePrice = ethers.parseEther("1");
      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        0, // Timed
        30 * 24 * 60 * 60,
        0,
        licensePrice,
        { value: licensePrice }
      );

      expect(await licenseManager.isLicenseValid(1)).to.be.true;

      // 7. Grant metadata access
      await metadataVault.connect(user1).grantAccess(
        1,
        user2.address,
        ethers.hexlify(ethers.randomBytes(32))
      );

      expect(await metadataVault.hasAccess(1, user2.address)).to.be.true;
    });

    it("Should support multiple users with parallel workflows", async function () {
      // User1 mints token 1
      const nonce1 = ethers.randomBytes(32);
      const msg1 = ethers.solidityPackedKeccak256(
        ["bytes32", "uint256", "address", "bytes32"],
        [bioHash1, 1, user1.address, nonce1]
      );
      const sig1 = await institution.signMessage(ethers.getBytes(msg1));

      await mintGateway.connect(user1).mintBioNFT(
        bioHash1,
        1,
        "ipfs://meta1",
        nonce1,
        sig1
      );

      // User2 mints token 2
      const nonce2 = ethers.randomBytes(32);
      const msg2 = ethers.solidityPackedKeccak256(
        ["bytes32", "uint256", "address", "bytes32"],
        [bioHash2, 1, user2.address, nonce2]
      );
      const sig2 = await institution.signMessage(ethers.getBytes(msg2));

      await mintGateway.connect(user2).mintBioNFT(
        bioHash2,
        1,
        "ipfs://meta2",
        nonce2,
        sig2
      );

      // Both stake
      await bioNFT.connect(user1).approve(await restakeVault.getAddress(), 1);
      await bioNFT.connect(user2).approve(await restakeVault.getAddress(), 2);
      
      await restakeVault.connect(user1).stake(1);
      await restakeVault.connect(user2).stake(2);

      // Both should accumulate rewards
      await time.increase(100);

      const rewards1 = await restakeVault.pendingRewards(user1.address);
      const rewards2 = await restakeVault.pendingRewards(user2.address);

      expect(rewards1).to.be.gt(0);
      expect(rewards2).to.be.gt(0);
    });
  });

  describe("Edge Cases and Security", function () {
    beforeEach(async function () {
      const nonce = ethers.randomBytes(32);
      const messageHash = ethers.solidityPackedKeccak256(
        ["bytes32", "uint256", "address", "bytes32"],
        [bioHash1, 1, user1.address, nonce]
      );
      const signature = await institution.signMessage(ethers.getBytes(messageHash));

      await mintGateway.connect(user1).mintBioNFT(
        bioHash1,
        1,
        "ipfs://metadata1",
        nonce,
        signature
      );
    });

    it("Should prevent double spending in staking", async function () {
      await bioNFT.connect(user1).approve(await restakeVault.getAddress(), 1);
      await restakeVault.connect(user1).stake(1);

      await expect(
        restakeVault.connect(user1).stake(1)
      ).to.be.revertedWith("Already staked");
    });

    it("Should prevent unauthorized license creation", async function () {
      await expect(
        licenseManager.connect(user2).issueLicense(
          1,
          user2.address,
          0,
          30 * 24 * 60 * 60,
          0,
          ethers.parseEther("1"),
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Not token owner");
    });

    it("Should prevent soulbound token transfer", async function () {
      await bioNFT.connect(user1).setSoulbound(1, true);

      await expect(
        bioNFT.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith("Token is soulbound");
    });
  });

  describe("Revenue Distribution", function () {
    beforeEach(async function () {
      const nonce = ethers.randomBytes(32);
      const messageHash = ethers.solidityPackedKeccak256(
        ["bytes32", "uint256", "address", "bytes32"],
        [bioHash1, 1, user1.address, nonce]
      );
      const signature = await institution.signMessage(ethers.getBytes(messageHash));

      await mintGateway.connect(user1).mintBioNFT(
        bioHash1,
        1,
        "ipfs://metadata1",
        nonce,
        signature
      );
    });

    it("Should correctly distribute license revenue", async function () {
      const licensePrice = ethers.parseEther("10");
      
      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        2, // Perpetual
        0,
        0,
        licensePrice,
        { value: licensePrice }
      );

      const ownerPending = await revenueSplitter.getPendingWithdrawal(user1.address);
      const institutionPending = await revenueSplitter.getPendingWithdrawal(institution.address);
      const protocolPending = await revenueSplitter.getPendingWithdrawal(protocol.address);

      expect(ownerPending).to.equal(ethers.parseEther("7")); // 70%
      expect(institutionPending).to.equal(ethers.parseEther("2")); // 20%
      expect(protocolPending).to.equal(ethers.parseEther("1")); // 10%
    });
  });
});

