const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BioNFT", function () {
  let bioNFT, mintGateway;
  let owner, gateway, user1, user2;
  const bioHash1 = ethers.keccak256(ethers.toUtf8Bytes("sample-dna-1"));
  const bioHash2 = ethers.keccak256(ethers.toUtf8Bytes("sample-dna-2"));

  beforeEach(async function () {
    [owner, gateway, user1, user2] = await ethers.getSigners();

    const BioNFT = await ethers.getContractFactory("BioNFT");
    bioNFT = await BioNFT.deploy();
    await bioNFT.waitForDeployment();

    await bioNFT.setMintGateway(gateway.address);
  });

  describe("Minting", function () {
    it("Should mint a new bio-NFT", async function () {
      const tx = await bioNFT.connect(gateway).mint(
        user1.address,
        bioHash1,
        1,
        "ipfs://metadata1"
      );

      await expect(tx)
        .to.emit(bioNFT, "BioNFTMinted")
        .withArgs(1, user1.address, bioHash1, 1);

      expect(await bioNFT.ownerOf(1)).to.equal(user1.address);
      expect(await bioNFT.getBioHash(1)).to.equal(bioHash1);
      expect(await bioNFT.getInstitutionId(1)).to.equal(1);
    });

    it("Should fail to mint with zero bio-hash", async function () {
      await expect(
        bioNFT.connect(gateway).mint(
          user1.address,
          ethers.ZeroHash,
          1,
          "ipfs://metadata"
        )
      ).to.be.revertedWith("Invalid bio-hash");
    });

    it("Should fail to mint duplicate bio-hash", async function () {
      await bioNFT.connect(gateway).mint(
        user1.address,
        bioHash1,
        1,
        "ipfs://metadata1"
      );

      await expect(
        bioNFT.connect(gateway).mint(
          user2.address,
          bioHash1,
          1,
          "ipfs://metadata2"
        )
      ).to.be.revertedWith("Bio-hash already minted");
    });

    it("Should fail if not called by mint gateway", async function () {
      await expect(
        bioNFT.connect(user1).mint(
          user1.address,
          bioHash1,
          1,
          "ipfs://metadata"
        )
      ).to.be.revertedWith("Only mint gateway");
    });
  });

  describe("Soulbound Functionality", function () {
    beforeEach(async function () {
      await bioNFT.connect(gateway).mint(
        user1.address,
        bioHash1,
        1,
        "ipfs://metadata1"
      );
    });

    it("Should allow owner to set soulbound", async function () {
      await expect(bioNFT.connect(user1).setSoulbound(1, true))
        .to.emit(bioNFT, "SoulboundToggled")
        .withArgs(1, true);

      expect(await bioNFT.isSoulbound(1)).to.be.true;
    });

    it("Should prevent transfer of soulbound token", async function () {
      await bioNFT.connect(user1).setSoulbound(1, true);

      await expect(
        bioNFT.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith("Token is soulbound");
    });

    it("Should allow transfer after unsetting soulbound", async function () {
      await bioNFT.connect(user1).setSoulbound(1, true);
      await bioNFT.connect(user1).setSoulbound(1, false);

      await bioNFT.connect(user1).transferFrom(user1.address, user2.address, 1);
      expect(await bioNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("Should fail if non-owner tries to set soulbound", async function () {
      await expect(
        bioNFT.connect(user2).setSoulbound(1, true)
      ).to.be.revertedWith("Not token owner");
    });
  });

  describe("Queries", function () {
    beforeEach(async function () {
      await bioNFT.connect(gateway).mint(
        user1.address,
        bioHash1,
        1,
        "ipfs://metadata1"
      );
      await bioNFT.connect(gateway).mint(
        user2.address,
        bioHash2,
        2,
        "ipfs://metadata2"
      );
    });

    it("Should return correct token URI", async function () {
      expect(await bioNFT.tokenURI(1)).to.equal("ipfs://metadata1");
    });

    it("Should return token ID by bio-hash", async function () {
      expect(await bioNFT.getTokenIdByBioHash(bioHash1)).to.equal(1);
      expect(await bioNFT.getTokenIdByBioHash(bioHash2)).to.equal(2);
    });

    it("Should return total supply", async function () {
      expect(await bioNFT.totalSupply()).to.equal(2);
    });

    it("Should fail to get bio-hash for non-existent token", async function () {
      await expect(bioNFT.getBioHash(999)).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Gateway Management", function () {
    it("Should allow owner to update mint gateway", async function () {
      await bioNFT.setMintGateway(user1.address);
      expect(await bioNFT.mintGateway()).to.equal(user1.address);
    });

    it("Should fail to set zero address as gateway", async function () {
      await expect(
        bioNFT.setMintGateway(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid gateway address");
    });

    it("Should fail if non-owner tries to set gateway", async function () {
      await expect(
        bioNFT.connect(user1).setMintGateway(user1.address)
      ).to.be.reverted;
    });
  });
});

