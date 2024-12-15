const hre = require("hardhat");

async function main() {
  console.log("Starting AstralSeed deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // Deploy InstitutionRegistry
  console.log("Deploying InstitutionRegistry...");
  const InstitutionRegistry = await hre.ethers.getContractFactory("InstitutionRegistry");
  const institutionRegistry = await InstitutionRegistry.deploy();
  await institutionRegistry.waitForDeployment();
  const institutionRegistryAddress = await institutionRegistry.getAddress();
  console.log("InstitutionRegistry deployed to:", institutionRegistryAddress, "\n");

  // Deploy BioNFT
  console.log("Deploying BioNFT...");
  const BioNFT = await hre.ethers.getContractFactory("BioNFT");
  const bioNFT = await BioNFT.deploy();
  await bioNFT.waitForDeployment();
  const bioNFTAddress = await bioNFT.getAddress();
  console.log("BioNFT deployed to:", bioNFTAddress, "\n");

  // Deploy MintGateway
  console.log("Deploying MintGateway...");
  const MintGateway = await hre.ethers.getContractFactory("MintGateway");
  const mintGateway = await MintGateway.deploy(bioNFTAddress, institutionRegistryAddress);
  await mintGateway.waitForDeployment();
  const mintGatewayAddress = await mintGateway.getAddress();
  console.log("MintGateway deployed to:", mintGatewayAddress, "\n");

  // Set MintGateway in BioNFT
  console.log("Setting MintGateway in BioNFT...");
  await bioNFT.setMintGateway(mintGatewayAddress);
  console.log("MintGateway set successfully\n");

  // Deploy RestakeVault
  console.log("Deploying RestakeVault...");
  const rewardRate = hre.ethers.parseEther("0.0001"); // 0.0001 ETH per second
  const RestakeVault = await hre.ethers.getContractFactory("RestakeVault");
  const restakeVault = await RestakeVault.deploy(bioNFTAddress, rewardRate);
  await restakeVault.waitForDeployment();
  const restakeVaultAddress = await restakeVault.getAddress();
  console.log("RestakeVault deployed to:", restakeVaultAddress, "\n");

  // Deploy RevenueSplitter
  console.log("Deploying RevenueSplitter...");
  const protocolFeeRecipient = deployer.address; // Using deployer as protocol recipient
  const RevenueSplitter = await hre.ethers.getContractFactory("RevenueSplitter");
  const revenueSplitter = await RevenueSplitter.deploy(
    bioNFTAddress,
    institutionRegistryAddress,
    protocolFeeRecipient
  );
  await revenueSplitter.waitForDeployment();
  const revenueSplitterAddress = await revenueSplitter.getAddress();
  console.log("RevenueSplitter deployed to:", revenueSplitterAddress, "\n");

  // Deploy LicenseManager
  console.log("Deploying LicenseManager...");
  const LicenseManager = await hre.ethers.getContractFactory("LicenseManager");
  const licenseManager = await LicenseManager.deploy(bioNFTAddress, revenueSplitterAddress);
  await licenseManager.waitForDeployment();
  const licenseManagerAddress = await licenseManager.getAddress();
  console.log("LicenseManager deployed to:", licenseManagerAddress, "\n");

  // Deploy MetadataVault
  console.log("Deploying MetadataVault...");
  const MetadataVault = await hre.ethers.getContractFactory("MetadataVault");
  const metadataVault = await MetadataVault.deploy(bioNFTAddress);
  await metadataVault.waitForDeployment();
  const metadataVaultAddress = await metadataVault.getAddress();
  console.log("MetadataVault deployed to:", metadataVaultAddress, "\n");

  // Summary
  console.log("=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("InstitutionRegistry:", institutionRegistryAddress);
  console.log("BioNFT:             ", bioNFTAddress);
  console.log("MintGateway:        ", mintGatewayAddress);
  console.log("RestakeVault:       ", restakeVaultAddress);
  console.log("RevenueSplitter:    ", revenueSplitterAddress);
  console.log("LicenseManager:     ", licenseManagerAddress);
  console.log("MetadataVault:      ", metadataVaultAddress);
  console.log("=".repeat(60));

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      InstitutionRegistry: institutionRegistryAddress,
      BioNFT: bioNFTAddress,
      MintGateway: mintGatewayAddress,
      RestakeVault: restakeVaultAddress,
      RevenueSplitter: revenueSplitterAddress,
      LicenseManager: licenseManagerAddress,
      MetadataVault: metadataVaultAddress,
    },
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

