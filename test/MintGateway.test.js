const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MintGateway", function () {
  let institutionRegistry, bioNFT, mintGateway;
  let owner, institution, user1, user2;
  const bioHash1 = ethers.keccak256(ethers.toUtf8Bytes("sample-dna-1"));
  const bioHash2 = ethers.keccak256(ethers.toUtf8Bytes("sample-dna-2"));

  async function signAttestation(signer, bioHash, institutionId, minter, nonce) {
    const messageHash = ethers.solidityPackedKeccak256(
      ["bytes32", "uint256", "address", "bytes32"],
      [bioHash, institutionId, minter, nonce]
    );
    const messageHashBytes = ethers.getBytes(messageHash);
    return await signer.signMessage(messageHashBytes);
  }

  beforeEach(async function () {
    [owner, institution, user1, user2] = await ethers.getSigners();

    // Deploy InstitutionRegistry
    const InstitutionRegistry = await ethers.getContractFactory("InstitutionRegistry");
    institutionRegistry = await InstitutionRegistry.deploy();
    await institutionRegistry.waitForDeployment();

    // Deploy BioNFT
    const BioNFT = await ethers.getContractFactory("BioNFT");
    bioNFT = await BioNFT.deploy();
    await bioNFT.waitForDeployment();

    // Deploy MintGateway
    const MintGateway = await ethers.getContractFactory("MintGateway");
    mintGateway = await MintGateway.deploy(
      await bioNFT.getAddress(),
      await institutionRegistry.getAddress()
    );
    await mintGateway.waitForDeployment();

    // Configure BioNFT
    await bioNFT.setMintGateway(await mintGateway.getAddress());

    // Register institution
    const REGISTRAR_ROLE = await institutionRegistry.REGISTRAR_ROLE();
    await institutionRegistry.grantRole(REGISTRAR_ROLE, owner.address);
    await institutionRegistry.registerInstitution(
      institution.address,
      "Test Lab",
      "ipfs://metadata"
    );
  });

  describe("Minting", function () {
    it("Should mint BioNFT with valid attestation", async function () {
      const institutionId = 1;
      const nonce = ethers.randomBytes(32);
      const signature = await signAttestation(
        institution,
        bioHash1,
        institutionId,
        user1.address,
        nonce
      );

      await expect(
        mintGateway.connect(user1).mintBioNFT(
          bioHash1,
          institutionId,
          "ipfs://metadata1",
          nonce,
          signature
        )
      ).to.emit(mintGateway, "MintRequested");

      expect(await bioNFT.ownerOf(1)).to.equal(user1.address);
      expect(await bioNFT.getBioHash(1)).to.equal(bioHash1);
    });

    it("Should fail with invalid signature", async function () {
      const institutionId = 1;
      const nonce = ethers.randomBytes(32);
      const wrongSignature = await signAttestation(
        user2, // Wrong signer
        bioHash1,
        institutionId,
        user1.address,
        nonce
      );

      await expect(
        mintGateway.connect(user1).mintBioNFT(
          bioHash1,
          institutionId,
          "ipfs://metadata1",
          nonce,
          wrongSignature
        )
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should fail with reused nonce", async function () {
      const institutionId = 1;
      const nonce = ethers.randomBytes(32);
      const signature = await signAttestation(
        institution,
        bioHash1,
        institutionId,
        user1.address,
        nonce
      );

      // First mint succeeds
      await mintGateway.connect(user1).mintBioNFT(
        bioHash1,
        institutionId,
        "ipfs://metadata1",
        nonce,
        signature
      );

      // Second mint with same nonce fails
      const signature2 = await signAttestation(
        institution,
        bioHash2,
        institutionId,
        user1.address,
        nonce
      );

      await expect(
        mintGateway.connect(user1).mintBioNFT(
          bioHash2,
          institutionId,
          "ipfs://metadata2",
          nonce,
          signature2
        )
      ).to.be.revertedWith("Nonce already used");
    });

    it("Should fail with inactive institution", async function () {
      const institutionId = 1;
      
      // Deactivate institution
      await institutionRegistry.deactivateInstitution(institutionId);

      const nonce = ethers.randomBytes(32);
      const signature = await signAttestation(
        institution,
        bioHash1,
        institutionId,
        user1.address,
        nonce
      );

      await expect(
        mintGateway.connect(user1).mintBioNFT(
          bioHash1,
          institutionId,
          "ipfs://metadata1",
          nonce,
          signature
        )
      ).to.be.revertedWith("Institution not active");
    });

    it("Should fail with zero bio-hash", async function () {
      const institutionId = 1;
      const nonce = ethers.randomBytes(32);
      const signature = await signAttestation(
        institution,
        ethers.ZeroHash,
        institutionId,
        user1.address,
        nonce
      );

      await expect(
        mintGateway.connect(user1).mintBioNFT(
          ethers.ZeroHash,
          institutionId,
          "ipfs://metadata1",
          nonce,
          signature
        )
      ).to.be.revertedWith("Invalid bio-hash");
    });

    it("Should increment institution attestation count", async function () {
      const institutionId = 1;
      
      const initialCount = (await institutionRegistry.getInstitution(institutionId))
        .attestationCount;

      const nonce = ethers.randomBytes(32);
      const signature = await signAttestation(
        institution,
        bioHash1,
        institutionId,
        user1.address,
        nonce
      );

      await mintGateway.connect(user1).mintBioNFT(
        bioHash1,
        institutionId,
        "ipfs://metadata1",
        nonce,
        signature
      );

      const finalCount = (await institutionRegistry.getInstitution(institutionId))
        .attestationCount;

      expect(finalCount).to.equal(initialCount + 1n);
    });
  });

  describe("Nonce Management", function () {
    it("Should track used nonces", async function () {
      const nonce = ethers.randomBytes(32);
      
      expect(await mintGateway.isNonceUsed(nonce)).to.be.false;

      const signature = await signAttestation(
        institution,
        bioHash1,
        1,
        user1.address,
        nonce
      );

      await mintGateway.connect(user1).mintBioNFT(
        bioHash1,
        1,
        "ipfs://metadata1",
        nonce,
        signature
      );

      expect(await mintGateway.isNonceUsed(nonce)).to.be.true;
    });

    it("Should allow different nonces for different mints", async function () {
      const nonce1 = ethers.randomBytes(32);
      const nonce2 = ethers.randomBytes(32);

      const sig1 = await signAttestation(
        institution,
        bioHash1,
        1,
        user1.address,
        nonce1
      );

      const sig2 = await signAttestation(
        institution,
        bioHash2,
        1,
        user2.address,
        nonce2
      );

      await mintGateway.connect(user1).mintBioNFT(
        bioHash1,
        1,
        "ipfs://metadata1",
        nonce1,
        sig1
      );

      await mintGateway.connect(user2).mintBioNFT(
        bioHash2,
        1,
        "ipfs://metadata2",
        nonce2,
        sig2
      );

      expect(await bioNFT.ownerOf(1)).to.equal(user1.address);
      expect(await bioNFT.ownerOf(2)).to.equal(user2.address);
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to update BioNFT address", async function () {
      const newBioNFT = await (await ethers.getContractFactory("BioNFT")).deploy();
      await mintGateway.setBioNFT(await newBioNFT.getAddress());
      
      expect(await mintGateway.bioNFT()).to.equal(await newBioNFT.getAddress());
    });

    it("Should allow owner to update InstitutionRegistry address", async function () {
      const newRegistry = await (await ethers.getContractFactory("InstitutionRegistry")).deploy();
      await mintGateway.setInstitutionRegistry(await newRegistry.getAddress());
      
      expect(await mintGateway.institutionRegistry()).to.equal(await newRegistry.getAddress());
    });

    it("Should fail if non-owner tries to update addresses", async function () {
      const newBioNFT = await (await ethers.getContractFactory("BioNFT")).deploy();
      
      await expect(
        mintGateway.connect(user1).setBioNFT(await newBioNFT.getAddress())
      ).to.be.reverted;
    });

    it("Should fail to set zero address", async function () {
      await expect(
        mintGateway.setBioNFT(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");

      await expect(
        mintGateway.setInstitutionRegistry(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Signature Verification Edge Cases", function () {
    it("Should fail with mismatched bio-hash in signature", async function () {
      const institutionId = 1;
      const nonce = ethers.randomBytes(32);
      
      // Sign with bioHash1
      const signature = await signAttestation(
        institution,
        bioHash1,
        institutionId,
        user1.address,
        nonce
      );

      // Try to mint with bioHash2
      await expect(
        mintGateway.connect(user1).mintBioNFT(
          bioHash2,
          institutionId,
          "ipfs://metadata1",
          nonce,
          signature
        )
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should fail with mismatched minter address", async function () {
      const institutionId = 1;
      const nonce = ethers.randomBytes(32);
      
      // Sign for user1
      const signature = await signAttestation(
        institution,
        bioHash1,
        institutionId,
        user1.address,
        nonce
      );

      // Try to mint as user2
      await expect(
        mintGateway.connect(user2).mintBioNFT(
          bioHash1,
          institutionId,
          "ipfs://metadata1",
          nonce,
          signature
        )
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should fail with mismatched institution ID", async function () {
      const institutionId = 1;
      const nonce = ethers.randomBytes(32);
      
      // Sign with institutionId 1
      const signature = await signAttestation(
        institution,
        bioHash1,
        institutionId,
        user1.address,
        nonce
      );

      // Try to mint with institutionId 2
      await expect(
        mintGateway.connect(user1).mintBioNFT(
          bioHash1,
          2,
          "ipfs://metadata1",
          nonce,
          signature
        )
      ).to.be.revertedWith("Invalid signature");
    });
  });
});

