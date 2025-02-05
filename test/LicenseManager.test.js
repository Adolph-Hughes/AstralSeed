const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("LicenseManager", function () {
  let bioNFT, revenueSplitter, licenseManager, institutionRegistry;
  let owner, institution, user1, user2, protocol;
  const bioHash = ethers.keccak256(ethers.toUtf8Bytes("sample-dna-1"));
  const oneDay = 24 * 60 * 60;

  beforeEach(async function () {
    [owner, institution, user1, user2, protocol] = await ethers.getSigners();

    // Deploy InstitutionRegistry
    const InstitutionRegistry = await ethers.getContractFactory("InstitutionRegistry");
    institutionRegistry = await InstitutionRegistry.deploy();
    await institutionRegistry.waitForDeployment();

    // Register institution
    const REGISTRAR_ROLE = await institutionRegistry.REGISTRAR_ROLE();
    await institutionRegistry.grantRole(REGISTRAR_ROLE, owner.address);
    await institutionRegistry.registerInstitution(
      institution.address,
      "Test Lab",
      "metadata"
    );

    // Deploy BioNFT
    const BioNFT = await ethers.getContractFactory("BioNFT");
    bioNFT = await BioNFT.deploy();
    await bioNFT.waitForDeployment();
    await bioNFT.setMintGateway(owner.address);

    // Deploy RevenueSplitter
    const RevenueSplitter = await ethers.getContractFactory("RevenueSplitter");
    revenueSplitter = await RevenueSplitter.deploy(
      await bioNFT.getAddress(),
      await institutionRegistry.getAddress(),
      protocol.address
    );
    await revenueSplitter.waitForDeployment();

    // Deploy LicenseManager
    const LicenseManager = await ethers.getContractFactory("LicenseManager");
    licenseManager = await LicenseManager.deploy(
      await bioNFT.getAddress(),
      await revenueSplitter.getAddress()
    );
    await licenseManager.waitForDeployment();

    // Mint test NFT
    await bioNFT.mint(user1.address, bioHash, 1, "ipfs://metadata");
  });

  describe("License Issuance", function () {
    it("Should issue a timed license", async function () {
      const price = ethers.parseEther("1");
      const duration = oneDay * 30; // 30 days

      await expect(
        licenseManager.connect(user1).issueLicense(
          1, // tokenId
          user2.address, // licensee
          0, // LicenseType.Timed
          duration,
          0, // usageLimit
          price,
          { value: price }
        )
      ).to.emit(licenseManager, "LicenseIssued");

      const license = await licenseManager.getLicense(1);
      expect(license.tokenId).to.equal(1);
      expect(license.licensee).to.equal(user2.address);
      expect(license.price).to.equal(price);
      expect(license.isActive).to.be.true;
    });

    it("Should issue a usage-based license", async function () {
      const price = ethers.parseEther("0.5");
      const usageLimit = 100;

      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        1, // LicenseType.Usage
        0,
        usageLimit,
        price,
        { value: price }
      );

      const license = await licenseManager.getLicense(1);
      expect(license.usageLimit).to.equal(usageLimit);
      expect(license.usageCount).to.equal(0);
    });

    it("Should issue a perpetual license", async function () {
      const price = ethers.parseEther("10");

      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        2, // LicenseType.Perpetual
        0,
        0,
        price,
        { value: price }
      );

      const license = await licenseManager.getLicense(1);
      expect(license.expiresAt).to.equal(0);
    });

    it("Should fail if not token owner", async function () {
      await expect(
        licenseManager.connect(user2).issueLicense(
          1,
          user2.address,
          0,
          oneDay,
          0,
          ethers.parseEther("1"),
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Not token owner");
    });

    it("Should fail with insufficient payment", async function () {
      const price = ethers.parseEther("1");

      await expect(
        licenseManager.connect(user1).issueLicense(
          1,
          user2.address,
          0,
          oneDay,
          0,
          price,
          { value: ethers.parseEther("0.5") } // Too little
        )
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("License Validation", function () {
    it("Should validate active timed license", async function () {
      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        0,
        oneDay * 7,
        0,
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      expect(await licenseManager.isLicenseValid(1)).to.be.true;
    });

    it("Should invalidate expired timed license", async function () {
      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        0,
        oneDay,
        0,
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      // Fast forward past expiration
      await time.increase(oneDay + 1);

      expect(await licenseManager.isLicenseValid(1)).to.be.false;
    });

    it("Should invalidate exhausted usage license", async function () {
      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        1, // Usage
        0,
        3, // 3 uses
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      // Use license 3 times
      await licenseManager.connect(user2).recordUsage(1);
      await licenseManager.connect(user2).recordUsage(1);
      await licenseManager.connect(user2).recordUsage(1);

      expect(await licenseManager.isLicenseValid(1)).to.be.false;
    });

    it("Should keep perpetual license valid", async function () {
      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        2, // Perpetual
        0,
        0,
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      await time.increase(oneDay * 365); // One year later

      expect(await licenseManager.isLicenseValid(1)).to.be.true;
    });
  });

  describe("License Revocation", function () {
    beforeEach(async function () {
      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        0,
        oneDay * 30,
        0,
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );
    });

    it("Should allow owner to revoke license", async function () {
      await expect(licenseManager.connect(user1).revokeLicense(1))
        .to.emit(licenseManager, "LicenseRevoked")
        .withArgs(1);

      const license = await licenseManager.getLicense(1);
      expect(license.isActive).to.be.false;
    });

    it("Should fail if not authorized to revoke", async function () {
      await expect(
        licenseManager.connect(user2).revokeLicense(1)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should fail to revoke already revoked license", async function () {
      await licenseManager.connect(user1).revokeLicense(1);

      await expect(
        licenseManager.connect(user1).revokeLicense(1)
      ).to.be.revertedWith("License already revoked");
    });
  });

  describe("Usage Recording", function () {
    beforeEach(async function () {
      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        1, // Usage
        0,
        10,
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );
    });

    it("Should record license usage", async function () {
      await expect(licenseManager.connect(user2).recordUsage(1))
        .to.emit(licenseManager, "LicenseUsed")
        .withArgs(1, 1);

      const license = await licenseManager.getLicense(1);
      expect(license.usageCount).to.equal(1);
    });

    it("Should increment usage count", async function () {
      await licenseManager.connect(user2).recordUsage(1);
      await licenseManager.connect(user2).recordUsage(1);
      await licenseManager.connect(user2).recordUsage(1);

      const license = await licenseManager.getLicense(1);
      expect(license.usageCount).to.equal(3);
    });

    it("Should fail to record usage on inactive license", async function () {
      await licenseManager.connect(user1).revokeLicense(1);

      await expect(
        licenseManager.connect(user2).recordUsage(1)
      ).to.be.revertedWith("License not active");
    });

    it("Should fail to record usage past limit", async function () {
      // Use all 10 times
      for (let i = 0; i < 10; i++) {
        await licenseManager.connect(user2).recordUsage(1);
      }

      await expect(
        licenseManager.connect(user2).recordUsage(1)
      ).to.be.revertedWith("License expired or limit reached");
    });
  });

  describe("Queries", function () {
    it("Should get licenses for token", async function () {
      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        0,
        oneDay,
        0,
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      const licenses = await licenseManager.getLicensesForToken(1);
      expect(licenses.length).to.equal(1);
      expect(licenses[0]).to.equal(1);
    });

    it("Should get licenses for licensee", async function () {
      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        0,
        oneDay,
        0,
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      const licenses = await licenseManager.getLicensesForLicensee(user2.address);
      expect(licenses.length).to.equal(1);
    });

    it("Should return total licenses", async function () {
      expect(await licenseManager.getTotalLicenses()).to.equal(0);

      await licenseManager.connect(user1).issueLicense(
        1,
        user2.address,
        0,
        oneDay,
        0,
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      expect(await licenseManager.getTotalLicenses()).to.equal(1);
    });
  });
});

