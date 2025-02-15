const { ethers } = require("hardhat");

/**
 * Generate a bio-hash from sample data
 * @param {string} sampleData - The sample biological data
 * @returns {string} The keccak256 hash
 */
function generateBioHash(sampleData) {
  return ethers.keccak256(ethers.toUtf8Bytes(sampleData));
}

/**
 * Generate a random nonce for minting
 * @returns {string} Random bytes32 nonce
 */
function generateNonce() {
  return ethers.hexlify(ethers.randomBytes(32));
}

/**
 * Sign an attestation message
 * @param {Object} signer - Ethers signer
 * @param {string} bioHash - The bio-hash
 * @param {number} institutionId - Institution ID
 * @param {string} minterAddress - Address of the minter
 * @param {string} nonce - Unique nonce
 * @returns {Promise<string>} The signature
 */
async function signAttestation(signer, bioHash, institutionId, minterAddress, nonce) {
  const messageHash = ethers.solidityPackedKeccak256(
    ["bytes32", "uint256", "address", "bytes32"],
    [bioHash, institutionId, minterAddress, nonce]
  );
  
  return await signer.signMessage(ethers.getBytes(messageHash));
}

/**
 * Format token ID for display
 * @param {number|BigInt} tokenId - The token ID
 * @returns {string} Formatted token ID
 */
function formatTokenId(tokenId) {
  return `#${tokenId.toString().padStart(4, '0')}`;
}

/**
 * Convert timestamp to readable date
 * @param {number|BigInt} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString();
}

/**
 * Calculate license expiration from duration
 * @param {number} durationInDays - Duration in days
 * @returns {number} Duration in seconds
 */
function calculateLicenseDuration(durationInDays) {
  return durationInDays * 24 * 60 * 60;
}

/**
 * Parse reward rate from ETH per day
 * @param {string} ethPerDay - ETH amount per day (e.g., "0.01")
 * @returns {BigInt} Reward rate per second in wei
 */
function parseRewardRate(ethPerDay) {
  const ethPerSecond = parseFloat(ethPerDay) / (24 * 60 * 60);
  return ethers.parseEther(ethPerSecond.toString());
}

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} Whether address is valid
 */
function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Wait for transaction confirmation
 * @param {Object} tx - Transaction response
 * @param {number} confirmations - Number of confirmations to wait for
 * @returns {Promise<Object>} Transaction receipt
 */
async function waitForTransaction(tx, confirmations = 1) {
  console.log(`Transaction submitted: ${tx.hash}`);
  console.log(`Waiting for ${confirmations} confirmation(s)...`);
  
  const receipt = await tx.wait(confirmations);
  
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  return receipt;
}

/**
 * Get gas price recommendation
 * @param {Object} provider - Ethers provider
 * @returns {Promise<Object>} Gas price info
 */
async function getGasPrice(provider) {
  const feeData = await provider.getFeeData();
  
  return {
    gasPrice: feeData.gasPrice,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
  };
}

/**
 * Estimate gas for transaction
 * @param {Object} contract - Contract instance
 * @param {string} functionName - Function to call
 * @param {Array} args - Function arguments
 * @returns {Promise<BigInt>} Estimated gas
 */
async function estimateGas(contract, functionName, args = []) {
  const estimatedGas = await contract[functionName].estimateGas(...args);
  const gasWithBuffer = estimatedGas * 120n / 100n; // Add 20% buffer
  
  return gasWithBuffer;
}

/**
 * Parse events from transaction receipt
 * @param {Object} receipt - Transaction receipt
 * @param {Object} contract - Contract instance
 * @param {string} eventName - Event name to parse
 * @returns {Array} Parsed events
 */
function parseEvents(receipt, contract, eventName) {
  const events = [];
  
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === eventName) {
        events.push(parsed.args);
      }
    } catch (e) {
      // Log might not be from this contract
      continue;
    }
  }
  
  return events;
}

/**
 * Get contract deployment cost
 * @param {Object} receipt - Deployment transaction receipt
 * @returns {Object} Cost information
 */
function getDeploymentCost(receipt) {
  const gasUsed = receipt.gasUsed;
  const effectiveGasPrice = receipt.gasPrice || receipt.effectiveGasPrice;
  const cost = gasUsed * effectiveGasPrice;
  
  return {
    gasUsed: gasUsed.toString(),
    gasPrice: ethers.formatUnits(effectiveGasPrice, "gwei"),
    totalCost: ethers.formatEther(cost),
  };
}

module.exports = {
  generateBioHash,
  generateNonce,
  signAttestation,
  formatTokenId,
  formatTimestamp,
  calculateLicenseDuration,
  parseRewardRate,
  isValidAddress,
  waitForTransaction,
  getGasPrice,
  estimateGas,
  parseEvents,
  getDeploymentCost,
};

