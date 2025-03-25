# Deployment Guide

Complete guide for deploying AstralSeed contracts to various networks.

## Prerequisites

### Required Tools
- Node.js v18+ installed
- npm or yarn package manager  
- Hardhat development environment
- Git for version control

### Required Accounts
- Wallet with deployment funds
- Block explorer API key (for verification)
- RPC endpoint access (Infura, Alchemy, or custom node)

### Estimated Costs

**Ethereum Mainnet** (approximate, varies with gas):
- Full protocol deployment: 2-4 ETH
- Single contract: 0.2-0.5 ETH

**Base Mainnet** (recommended):
- Full protocol deployment: 0.01-0.05 ETH
- Single contract: 0.001-0.005 ETH

**Test Networks**: Free (use faucets)

## Environment Setup

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/Adolph-Hughes/AstralSeed.git
cd AstralSeed
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment

Copy the example environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` with your configuration:

\`\`\`bash
# Network RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# Deployment Account
PRIVATE_KEY=your_private_key_here

# Block Explorer API Keys  
BASESCAN_API_KEY=your_basescan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Protocol Configuration
REWARD_RATE=100000000000000
DEFAULT_ROYALTY_BPS=1000
\`\`\`

**⚠️ Security Warning**: Never commit your \`.env\` file or share private keys!

### 4. Compile Contracts

\`\`\`bash
npm run compile
\`\`\`

Verify compilation succeeds without errors.

### 5. Run Tests

\`\`\`bash
npm run test
\`\`\`

Ensure all tests pass before deploying.

## Deployment Steps

### Local Network (Development)

Perfect for testing and development.

#### Step 1: Start Local Node

Terminal 1:
\`\`\`bash
npx hardhat node
\`\`\`

This starts a local Ethereum network on port 8545 with pre-funded accounts.

#### Step 2: Deploy Contracts

Terminal 2:
\`\`\`bash
npm run deploy:local
\`\`\`

Contracts will be deployed to local network. Save the deployment.json file.

#### Step 3: Test Deployment

\`\`\`bash
npx hardhat run scripts/mint-example.js --network localhost
\`\`\`

### Testnet Deployment (Base Sepolia)

Recommended for testing before mainnet.

#### Step 1: Get Testnet Funds

Visit Base Sepolia faucet:
- https://faucet.quicknode.com/base/sepolia
- Request testnet ETH
- Wait for confirmation

#### Step 2: Deploy to Testnet

\`\`\`bash
npm run deploy:testnet
\`\`\`

Deployment script will:
1. Deploy InstitutionRegistry
2. Deploy BioNFT
3. Deploy MintGateway
4. Configure connections
5. Deploy RestakeVault
6. Deploy RevenueSplitter
7. Deploy LicenseManager
8. Deploy MetadataVault
9. Save addresses to deployment.json

#### Step 3: Verify Contracts

\`\`\`bash
npm run verify --network baseSepolia
\`\`\`

This publishes contract source code to BaseScan.

#### Step 4: Test on Testnet

\`\`\`bash
npx hardhat run scripts/mint-example.js --network baseSepolia
\`\`\`

### Mainnet Deployment (Production)

**⚠️ Important**: Test thoroughly on testnet first!

#### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Contracts audited
- [ ] Deployment script reviewed
- [ ] Private key secured (use hardware wallet)
- [ ] Sufficient ETH for gas
- [ ] Deployment plan documented
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Monitoring configured

#### Step 1: Dry Run

Test deployment script without executing:

\`\`\`bash
npx hardhat run scripts/deploy.js --network base --dry-run
\`\`\`

Review all operations and gas estimates.

#### Step 2: Deploy to Mainnet

\`\`\`bash
npm run deploy --network base
\`\`\`

**Monitor carefully**:
- Watch for transaction confirmations
- Verify each contract deploys successfully
- Check deployment.json is created
- Save all transaction hashes

#### Step 3: Verify on BaseScan

\`\`\`bash
npm run verify --network base
\`\`\`

Verification makes contracts readable on block explorer.

#### Step 4: Post-Deployment Configuration

Run configuration script:

\`\`\`bash
npx hardhat run scripts/configure.js --network base
\`\`\`

This sets up:
- Role permissions
- Initial parameters
- Contract connections

#### Step 5: Test Production Deployment

Perform smoke tests:
1. View contracts on BaseScan
2. Test read functions
3. Execute small test transaction
4. Verify events emitted correctly

#### Step 6: Transfer Ownership (if needed)

If using a deployment wallet different from operational wallet:

\`\`\`bash
npx hardhat run scripts/transfer-ownership.js --network base
\`\`\`

## Deployment Scripts

### deploy.js

Main deployment script. Deploys all contracts in correct order.

**Usage**:
\`\`\`bash
npx hardhat run scripts/deploy.js --network <NETWORK>
\`\`\`

**Outputs**:
- \`deployment.json\`: Contract addresses and metadata
- Transaction hashes logged to console

### verify.js

Verifies all deployed contracts on block explorer.

**Usage**:
\`\`\`bash
npx hardhat run scripts/verify.js --network <NETWORK>
\`\`\`

### configure.js

Post-deployment configuration.

**Usage**:
\`\`\`bash
npx hardhat run scripts/configure.js --network <NETWORK>
\`\`\`

## Network Configuration

### Base Mainnet

\`\`\`javascript
base: {
  url: "https://mainnet.base.org",
  chainId: 8453,
  accounts: [process.env.PRIVATE_KEY],
  gasPrice: "auto"
}
\`\`\`

**Block Explorer**: https://basescan.org

### Base Sepolia

\`\`\`javascript
baseSepolia: {
  url: "https://sepolia.base.org",
  chainId: 84532,
  accounts: [process.env.PRIVATE_KEY],
  gasPrice: "auto"
}
\`\`\`

**Block Explorer**: https://sepolia.basescan.org  
**Faucet**: https://faucet.quicknode.com/base/sepolia

### Ethereum Mainnet

\`\`\`javascript
ethereum: {
  url: process.env.ETHEREUM_RPC_URL,
  chainId: 1,
  accounts: [process.env.PRIVATE_KEY],
  gasPrice: "auto"
}
\`\`\`

**Block Explorer**: https://etherscan.io

## Troubleshooting

### Gas Issues

**Problem**: Transaction fails with "out of gas"

**Solution**:
\`\`\`javascript
// Increase gas limit
await contract.method({ gasLimit: 500000 })
\`\`\`

### Nonce Issues

**Problem**: "Nonce too low" or "nonce already used"

**Solution**:
\`\`\`bash
npx hardhat reset-nonce --network base
\`\`\`

### Verification Fails

**Problem**: Contract verification fails on block explorer

**Solutions**:
1. Ensure contract is fully confirmed (wait 5+ blocks)
2. Check constructor arguments are correct
3. Try flattened contract:
\`\`\`bash
npx hardhat flatten contracts/BioNFT.sol > BioNFT_flat.sol
\`\`\`

### Deployment Hangs

**Problem**: Deployment script hangs without error

**Solutions**:
1. Check RPC endpoint is responding
2. Verify network connectivity
3. Increase timeout in hardhat.config.js:
\`\`\`javascript
mocha: {
  timeout: 100000
}
\`\`\`

### Wrong Network

**Problem**: Deployed to wrong network

**Solution**: Cannot undo blockchain transactions. Redeploy to correct network.

## Post-Deployment

### 1. Save Deployment Info

Backup \`deployment.json\`:
\`\`\`bash
cp deployment.json deployments/mainnet-$(date +%Y%m%d).json
git add deployments/
git commit -m "docs: save mainnet deployment"
\`\`\`

### 2. Update Documentation

Update README.md with contract addresses:
\`\`\`markdown
## Deployed Contracts (Base Mainnet)

- BioNFT: 0x...
- MintGateway: 0x...
- RestakeVault: 0x...
\`\`\`

### 3. Configure Frontend

Update frontend configuration with new addresses.

### 4. Set Up Monitoring

Configure monitoring for:
- Contract balance
- Transaction volume
- Error rates
- Gas usage

### 5. Enable Alerts

Set up alerts for:
- Contract paused
- Large withdrawals
- Failed transactions
- Unusual activity

## Security Best Practices

### During Deployment

1. **Use Hardware Wallet**: For mainnet deployments
2. **Verify Addresses**: Double-check all addresses
3. **Test First**: Always test on testnet
4. **Limit Exposure**: Use deployment wallet with minimal funds
5. **Monitor**: Watch transactions in real-time

### After Deployment

1. **Transfer Ownership**: Move to multisig or DAO
2. **Set Up Roles**: Configure AccessControl roles
3. **Enable Monitoring**: Track all contract activity
4. **Document**: Save all deployment details
5. **Backup**: Secure backup of keys and config

## Upgrade Strategy

Current contracts are non-upgradeable. For upgrades:

1. **Deploy New Version**: Deploy updated contracts
2. **Migrate Data**: Transfer necessary state
3. **Update Frontend**: Point to new addresses
4. **Deprecate Old**: Mark old contracts as deprecated
5. **Communicate**: Inform users of changes

Consider using upgradeable proxies (UUPS) for future versions.

## Cost Optimization

### Gas Saving Tips

1. **Batch Operations**: Group multiple actions
2. **Off-Peak Timing**: Deploy during low gas periods
3. **Optimize Code**: Use gas-efficient patterns
4. **Right Network**: Consider L2s like Base

### Network Comparison

| Network | Deployment Cost | Transaction Cost |
|---------|----------------|------------------|
| Ethereum | $2000-4000 | $50-200 |
| Base | $10-50 | $0.5-2 |
| Base Sepolia | Free | Free |

## Support

### Issues

- GitHub Issues: https://github.com/Adolph-Hughes/AstralSeed/issues
- Email: deploy@astralseed.io

### Resources

- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin](https://docs.openzeppelin.com/)
- [Base Docs](https://docs.base.org/)

---

**Ready to deploy?** Follow the checklist and deploy with confidence! 🚀
