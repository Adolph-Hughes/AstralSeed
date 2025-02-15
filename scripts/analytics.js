const hre = require("hardhat");
const fs = require("fs");

/**
 * Analytics script for AstralSeed protocol
 * Generates statistics and insights from on-chain data
 */
async function main() {
  console.log("AstralSeed Protocol Analytics\n");
  console.log("=".repeat(60));

  const deploymentInfo = JSON.parse(fs.readFileSync("deployment.json", "utf8"));

  // Connect to contracts
  const bioNFT = await hre.ethers.getContractAt("BioNFT", deploymentInfo.contracts.BioNFT);
  const institutionRegistry = await hre.ethers.getContractAt(
    "InstitutionRegistry",
    deploymentInfo.contracts.InstitutionRegistry
  );
  const restakeVault = await hre.ethers.getContractAt(
    "RestakeVault",
    deploymentInfo.contracts.RestakeVault
  );

  // Fetch statistics
  const totalNFTs = await bioNFT.totalSupply();
  const totalInstitutions = await institutionRegistry.getTotalInstitutions();
  const rewardsPool = await restakeVault.getRewardsPool();

  console.log("\nProtocol Statistics:");
  console.log("-".repeat(60));
  console.log(`Total Bio-NFTs Minted: ${totalNFTs}`);
  console.log(`Total Institutions: ${totalInstitutions}`);
  console.log(`Rewards Pool Balance: ${hre.ethers.formatEther(rewardsPool)} ETH`);

  // Get institution details
  console.log("\nInstitutions:");
  console.log("-".repeat(60));
  for (let i = 1; i <= Number(totalInstitutions); i++) {
    const institution = await institutionRegistry.getInstitution(i);
    console.log(`\n[${i}] ${institution.name}`);
    console.log(`    Address: ${institution.pubkey}`);
    console.log(`    Active: ${institution.isActive}`);
    console.log(`    Attestations: ${institution.attestationCount}`);
  }

  // Export data
  const analytics = {
    timestamp: new Date().toISOString(),
    network: hre.network.name,
    statistics: {
      totalNFTs: totalNFTs.toString(),
      totalInstitutions: totalInstitutions.toString(),
      rewardsPool: hre.ethers.formatEther(rewardsPool),
    },
  };

  fs.writeFileSync("analytics.json", JSON.stringify(analytics, null, 2));
  console.log("\n" + "=".repeat(60));
  console.log("Analytics exported to analytics.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

