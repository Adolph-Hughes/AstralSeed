const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InstitutionRegistry", function () {
  let institutionRegistry;
  let owner, registrar, institution1, institution2;

  beforeEach(async function () {
    [owner, registrar, institution1, institution2] = await ethers.getSigners();

    const InstitutionRegistry = await ethers.getContractFactory("InstitutionRegistry");
    institutionRegistry = await InstitutionRegistry.deploy();
    await institutionRegistry.waitForDeployment();

    // Grant registrar role
    const REGISTRAR_ROLE = await institutionRegistry.REGISTRAR_ROLE();
    await institutionRegistry.grantRole(REGISTRAR_ROLE, registrar.address);
  });

  describe("Registration", function () {
    it("Should register a new institution", async function () {
      const tx = await institutionRegistry.connect(registrar).registerInstitution(
        institution1.address,
        "Research Lab 1",
        "ipfs://Qm..."
      );

      await expect(tx)
        .to.emit(institutionRegistry, "InstitutionRegistered")
        .withArgs(1, institution1.address, "Research Lab 1");

      const institution = await institutionRegistry.getInstitution(1);
      expect(institution.name).to.equal("Research Lab 1");
      expect(institution.pubkey).to.equal(institution1.address);
      expect(institution.isActive).to.be.true;
    });

    it("Should fail to register with zero address", async function () {
      await expect(
        institutionRegistry.connect(registrar).registerInstitution(
          ethers.ZeroAddress,
          "Lab",
          "metadata"
        )
      ).to.be.revertedWith("Invalid pubkey");
    });

    it("Should fail to register duplicate pubkey", async function () {
      await institutionRegistry.connect(registrar).registerInstitution(
        institution1.address,
        "Lab 1",
        "metadata"
      );

      await expect(
        institutionRegistry.connect(registrar).registerInstitution(
          institution1.address,
          "Lab 2",
          "metadata"
        )
      ).to.be.revertedWith("Institution already registered");
    });

    it("Should fail if not registrar", async function () {
      await expect(
        institutionRegistry.connect(institution1).registerInstitution(
          institution1.address,
          "Lab",
          "metadata"
        )
      ).to.be.reverted;
    });
  });

  describe("Deactivation and Reactivation", function () {
    beforeEach(async function () {
      await institutionRegistry.connect(registrar).registerInstitution(
        institution1.address,
        "Research Lab 1",
        "ipfs://Qm..."
      );
    });

    it("Should deactivate an institution", async function () {
      await expect(institutionRegistry.deactivateInstitution(1))
        .to.emit(institutionRegistry, "InstitutionDeactivated")
        .withArgs(1);

      expect(await institutionRegistry.isInstitutionActive(1)).to.be.false;
    });

    it("Should reactivate an institution", async function () {
      await institutionRegistry.deactivateInstitution(1);
      
      await expect(institutionRegistry.reactivateInstitution(1))
        .to.emit(institutionRegistry, "InstitutionReactivated")
        .withArgs(1);

      expect(await institutionRegistry.isInstitutionActive(1)).to.be.true;
    });
  });

  describe("Attestation Count", function () {
    beforeEach(async function () {
      await institutionRegistry.connect(registrar).registerInstitution(
        institution1.address,
        "Research Lab 1",
        "ipfs://Qm..."
      );
    });

    it("Should increment attestation count", async function () {
      await institutionRegistry.incrementAttestationCount(1);
      
      const institution = await institutionRegistry.getInstitution(1);
      expect(institution.attestationCount).to.equal(1);
    });

    it("Should fail to increment for inactive institution", async function () {
      await institutionRegistry.deactivateInstitution(1);
      
      await expect(
        institutionRegistry.incrementAttestationCount(1)
      ).to.be.revertedWith("Institution not active");
    });
  });

  describe("Queries", function () {
    it("Should return total institutions", async function () {
      expect(await institutionRegistry.getTotalInstitutions()).to.equal(0);

      await institutionRegistry.connect(registrar).registerInstitution(
        institution1.address,
        "Lab 1",
        "metadata1"
      );
      await institutionRegistry.connect(registrar).registerInstitution(
        institution2.address,
        "Lab 2",
        "metadata2"
      );

      expect(await institutionRegistry.getTotalInstitutions()).to.equal(2);
    });

    it("Should get institution ID by pubkey", async function () {
      await institutionRegistry.connect(registrar).registerInstitution(
        institution1.address,
        "Lab 1",
        "metadata"
      );

      const id = await institutionRegistry.getInstitutionIdByPubkey(institution1.address);
      expect(id).to.equal(1);
    });
  });
});

