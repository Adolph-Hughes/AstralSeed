const hre = require("hardhat");
const { 
  generateBioHash, 
  generateNonce, 
  signAttestation,
  waitForTransaction,
  formatTokenId
} = require("./utils");

/**
 * Example script demonstrating how to mint a BioNFT
 * This script shows the complete minting workflow with institution attestation
 */
async function main() {
  console.log("AstralSeed BioNFT Minting Example\n");
  console.log("=".repeat(60));

  // Load deployment info
  const fs = require("fs");
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("deployment.json", "utf8"));
  } catch (error) {
    console.error("Error: deployment.json not found. Please deploy contracts first.");
    process.exit(1);
  }

  // Get signers
  const [deployer, institutionSigner, user] = await hre.ethers.getSigners();
  
  console.log("\nAccounts:");
  console.log("  Deployer:    ", deployer.address);
  console.log("  Institution: ", institutionSigner.address);
  console.log("  User:        ", user.address);
  console.log();

  // Connect to deployed contracts
  const institutionRegistry = await hre.ethers.getContractAt(
    "InstitutionRegistry",
    deploymentInfo.contracts.InstitutionRegistry
  );

  const bioNFT = await hre.ethers.getContractAt(
    "BioNFT",
    deploymentInfo.contracts.BioNFT
  );

  const mintGateway = await hre.ethers.getContractAt(
    "MintGateway",
    deploymentInfo.contracts.MintGateway
  );

  // Step 1: Register institution (if not already registered)
  console.log("Step 1: Registering Research Institution");
  console.log("-".repeat(60));

  let institutionId;
  try {
    const tx = await institutionRegistry.registerInstitution(
      institutionSigner.address,
      "GenomeLab Research Institute",
      "ipfs://QmExampleMetadataHashForInstitution"
    );
    
    const receipt = await waitForTransaction(tx);
    
    // Get institution ID from event
    const registeredEvent = receipt.logs
      .map(log => {
        try {
          return institutionRegistry.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find(event => event && event.name === "InstitutionRegistered");

    institutionId = registeredEvent.args[0];
    console.log(`✓ Institution registered with ID: ${institutionId}`);
  } catch (error) {
    if (error.message.includes("already registered")) {
      institutionId = await institutionRegistry.getInstitutionIdByPubkey(
        institutionSigner.address
      );
      console.log(`✓ Institution already registered with ID: ${institutionId}`);
    } else {
      throw error;
    }
  }

  // Step 2: Generate bio-hash from sample data
  console.log("\nStep 2: Generating Bio-Hash");
  console.log("-".repeat(60));
  
  const sampleBioData = "SAMPLE_DNA_SEQUENCE_ACGT_" + Date.now();
  const bioHash = generateBioHash(sampleBioData);
  
  console.log(`✓ Bio-hash generated: ${bioHash}`);

  // Step 3: Create attestation signature
  console.log("\nStep 3: Institution Attestation");
  console.log("-".repeat(60));
  
  const nonce = generateNonce();
  const signature = await signAttestation(
    institutionSigner,
    bioHash,
    institutionId,
    user.address,
    nonce
  );
  
  console.log(`✓ Attestation signature created`);
  console.log(`  Nonce: ${nonce}`);

  // Step 4: Mint BioNFT
  console.log("\nStep 4: Minting BioNFT");
  console.log("-".repeat(60));
  
  const metadataURI = "ipfs://QmExampleMetadataHashForBioNFT";
  
  const mintTx = await mintGateway.connect(user).mintBioNFT(
    bioHash,
    institutionId,
    metadataURI,
    nonce,
    signature
  );
  
  const mintReceipt = await waitForTransaction(mintTx);
  
  // Get token ID from event
  const mintedEvent = mintReceipt.logs
    .map(log => {
      try {
        return bioNFT.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(event => event && event.name === "BioNFTMinted");

  const tokenId = mintedEvent.args[0];
  
  console.log(`✓ BioNFT minted successfully!`);
  console.log(`  Token ID: ${formatTokenId(tokenId)}`);
  console.log(`  Owner: ${user.address}`);
  console.log(`  Bio-Hash: ${bioHash}`);
  console.log(`  Institution ID: ${institutionId}`);
  console.log(`  Metadata: ${metadataURI}`);

  // Step 5: Verify NFT ownership
  console.log("\nStep 5: Verification");
  console.log("-".repeat(60));
  
  const owner = await bioNFT.ownerOf(tokenId);
  const storedBioHash = await bioNFT.getBioHash(tokenId);
  const storedInstitutionId = await bioNFT.getInstitutionId(tokenId);
  const tokenURI = await bioNFT.tokenURI(tokenId);
  
  console.log(`✓ NFT verified on-chain`);
  console.log(`  Owner matches: ${owner === user.address}`);
  console.log(`  Bio-hash matches: ${storedBioHash === bioHash}`);
  console.log(`  Institution matches: ${storedInstitutionId === institutionId}`);
  console.log(`  Token URI: ${tokenURI}`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Minting Complete!");
  console.log("=".repeat(60));
  console.log(`
Next steps:
  1. Store encrypted metadata using MetadataVault
  2. Stake the NFT in RestakeVault to earn rewards
  3. Create licenses using LicenseManager
  4. Manage metadata access permissions
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nError:", error.message);
    process.exit(1);
  });

