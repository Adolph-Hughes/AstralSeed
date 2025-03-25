# Frequently Asked Questions (FAQ)

## General Questions

### What is AstralSeed?

AstralSeed is a privacy-preserving blockchain protocol for tokenizing and managing biological data ownership. It allows individuals and institutions to create NFTs that represent ownership of bio-data without exposing the raw genetic information on-chain.

### How does AstralSeed ensure privacy?

- **No Raw Data On-Chain**: Only cryptographic hashes (bio-hashes) are stored on the blockchain
- **Encrypted Metadata**: All sensitive data is encrypted before being stored on IPFS
- **Access Control**: Granular permissions system for metadata access
- **Zero-Knowledge Proofs**: Optional zk-proof support for data verification without exposure

### What blockchain does AstralSeed use?

AstralSeed is built for EVM-compatible chains, with primary support for:
- Ethereum Mainnet
- Base (Coinbase Layer 2) - recommended for lower gas fees
- Base Sepolia (testnet for development)

### Why use Base instead of Ethereum?

Base offers:
- Significantly lower gas fees (10-100x cheaper)
- Fast transaction finality (2 seconds)
- Full Ethereum compatibility
- Backed by Coinbase infrastructure

## Technical Questions

### How are bio-hashes generated?

Bio-hashes are keccak256 cryptographic hashes of biological data:

```javascript
const bioHash = ethers.keccak256(ethers.toUtf8Bytes(biologicalData));
```

The hashing happens off-chain in secure environments before any data touches the blockchain. This creates a cryptographic commitment without revealing the underlying data.

### Can the same bio-data be minted multiple times?

No. The protocol enforces uniqueness at the smart contract level:
- Each bio-hash can only be minted once
- Duplicate attempts will fail with "Bio-hash already minted" error
- This prevents double-claiming and ensures data integrity

### What is a soulbound NFT?

A soulbound NFT (SBT) is non-transferable and permanently bound to the original owner's wallet:
- Useful for identity-based bio-NFTs
- Cannot be sold or transferred
- Can be toggled on/off by the owner
- Provides stronger guarantees for personal data

### How do institutions attest to bio-NFTs?

Institutions sign attestations using ECDSA signatures:

1. Institution generates signature: `sign(bioHash, institutionId, minter, nonce)`
2. User submits mint request with signature
3. MintGateway verifies signature matches registered institution
4. If valid, NFT is minted with institution attribution

This creates a trust chain: NFT → Institution → Bio-data

### What prevents replay attacks?

Nonce-based replay protection:
- Each mint requires a unique nonce
- Nonces are marked as "used" after successful mint
- Reusing a nonce causes transaction to fail
- Prevents signature reuse across different mints

## Staking & Rewards

### How does restaking work?

Restaking allows NFT holders to earn rewards:

1. **Stake**: Lock your NFT in the RestakeVault
2. **Earn**: Accumulate rewards based on time staked
3. **Unstake**: Withdraw NFT and claim rewards anytime

Formula: `rewards = stakedTime × rewardRate × numberOfNFTs`

### Can I unstake anytime?

Yes! Staking is completely non-custodial:
- No lock-up periods
- Unstake whenever you want
- Rewards automatically claimed on unstake
- You retain ownership throughout

### Where do rewards come from?

Rewards are funded by:
- Research institutions purchasing data access
- Protocol revenue from licensing fees
- Partner contributions to research pools
- Treasury allocations

The rewards pool must be funded by the protocol owner before stakers can earn.

### What happens if the rewards pool runs out?

- Staking continues to work normally
- Rewards stop accumulating when pool is depleted
- Protocol owner can refill the pool anytime
- Existing pending rewards remain claimable

## Licensing

### What types of licenses are available?

Three license types:

1. **Timed License**: Valid for specific duration (e.g., 30 days)
   - Expires after time period
   - Good for temporary research access
   
2. **Usage-Based License**: Limited number of uses (e.g., 100 queries)
   - Expires after usage count reached
   - Good for API access or data queries
   
3. **Perpetual License**: No expiration
   - One-time payment for unlimited access
   - Good for permanent research datasets

### How are license payments distributed?

Automatic distribution via RevenueSplitter:

```
100% License Fee
├── 70% → NFT Owner
├── 20% → Attesting Institution
└── 10% → Protocol Treasury
```

Split percentages are configurable by governance.

### Can I revoke a license?

Yes! NFT owners can revoke licenses at any time:
- Useful if licensee violates terms
- Immediate effect
- No refunds (handled off-chain if needed)
- Emits `LicenseRevoked` event

### How do I set license pricing?

NFT owners set pricing per license:
- No minimum or maximum
- Can be 0 (free license)
- Denominated in ETH
- Different prices for different license types

## Security

### Is my private data safe?

Yes, your raw biological data never goes on-chain:
- Only cryptographic hashes stored publicly
- Metadata encrypted before IPFS upload
- Access keys encrypted per recipient
- No one can reverse-engineer your data from the hash

### What if I lose my wallet?

Your bio-NFT is permanently tied to your wallet address:
- Lost wallet = lost NFT access
- Cannot be recovered without wallet access
- **Recommendation**: Use hardware wallet or multi-sig
- Store recovery phrases securely offline

### Have contracts been audited?

Current status: Pre-audit

Planned:
- Internal security review: Q3 2025
- External audit by tier-1 firm: Q4 2025
- Bug bounty program: Post-audit

Check `docs/SECURITY.md` for latest audit status.

### What if there's a critical bug?

Emergency procedures:
1. Contract can be paused by owner
2. All transfers and operations halt
3. Bug fixed and tested
4. New version deployed
5. Migration path provided
6. Post-mortem published

## Economics

### What are the fees?

**Protocol Fees**:
- Minting: Gas only (no protocol fee)
- Staking: Gas only
- Unstaking: Gas only
- Licensing: 10% of license fee goes to protocol

**Gas Estimates** (on Base):
- Mint: ~$0.50-1.00
- Stake: ~$0.20-0.40
- License: ~$0.30-0.60

### How do I withdraw earnings?

Use the pull payment pattern:

```javascript
// Check pending balance
const pending = await revenueSplitter.getPendingWithdrawal(address);

// Withdraw
await revenueSplitter.withdraw();
```

Funds are transferred to your wallet immediately.

### Can I change revenue split percentages?

Only protocol governance can change splits:
- Requires governance proposal
- Community vote
- Timelock delay
- Applies to future licenses only

Individual NFT owners cannot override protocol splits.

## Integration

### Can I integrate AstralSeed into my app?

Absolutely! All contracts are open-source:
- Full API documentation in `docs/API.md`
- Example scripts in `scripts/` directory
- Integration guide in `docs/INTEGRATIONS.md`
- Contract ABIs in `artifacts/`

### Is there a JavaScript SDK?

Not yet, but you can use ethers.js directly:

```javascript
const bioNFT = new ethers.Contract(address, abi, signer);
const balance = await bioNFT.balanceOf(userAddress);
```

Community SDKs may become available.

### Do you have a Graph subgraph?

Subgraph deployment is planned for Q1 2026. This will enable:
- Complex queries
- Historical data
- Event indexing
- Analytics dashboards

### Can I use this with React/Vue/Angular?

Yes! Standard Web3 integration:

```javascript
// React example
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);
```

Works with any Web3-enabled frontend framework.

## Institutions

### How do I register as an institution?

Contact protocol governance:
1. Submit verification documents
2. Provide institution details
3. Generate signing keypair
4. Pay registration fee (if applicable)
5. Receive institution ID

Requires approval from address with `REGISTRAR_ROLE`.

### What are institution responsibilities?

Institutions must:
- Verify authenticity of biological data
- Sign attestations accurately
- Maintain operational security
- Follow ethical guidelines
- Keep signing keys secure

### Can institution status be revoked?

Yes, if institutions:
- Provide fraudulent attestations
- Violate protocol policies
- Fail security audits
- Cease operations

Governance can deactivate institutions, preventing new attestations.

### Do institutions earn revenue?

Yes! Institutions receive 20% of all license fees for NFTs they attested:
- Passive income stream
- Incentivizes quality attestations
- Accumulated and claimable via RevenueSplitter

## Development

### How do I run tests?

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run all tests
npm run test

# With gas reporting
npm run test:gas

# Coverage report
npm run coverage
```

### How do I deploy locally?

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy:local

# Terminal 3: Run example script
npm run mint
```

### Where can I report bugs?

- GitHub Issues: https://github.com/Adolph-Hughes/AstralSeed/issues
- Security issues: security@astralseed.io (do NOT create public issues)
- General questions: Discussions tab

### How can I contribute?

See `CONTRIBUTING.md` for guidelines:
- Fork repository
- Create feature branch
- Write tests
- Submit pull request
- Respond to review feedback

## Roadmap

### What's coming next?

**Q4 2025**: Mainnet Launch
- Security audit completion
- Bug bounty program
- Production deployment

**Q1 2026**: Ecosystem Growth
- Graph subgraph
- Frontend interface
- Mobile SDK

**Q2 2026**: Advanced Features
- FHE integration
- Cross-chain bridge
- License marketplace

**Q3 2026**: Governance
- DAO structure
- Governance token
- Community voting

See `docs/ROADMAP.md` for detailed timeline.

### Will there be a token?

Not initially. Possible governance token in 2026 if:
- Community desires it
- Regulatory clarity improves
- DAO governance needed

Would be used for:
- Protocol governance
- Staking rewards
- Fee discounts

## Support

### How do I get help?

Multiple channels:
- Documentation: `docs/` directory
- GitHub Issues: Bug reports and questions
- Email: info@astralseed.io
- Discord: TBD (coming soon)

### Response times?

- Critical security issues: < 24 hours
- Bug reports: 2-3 days
- Feature requests: 1 week
- General questions: Best effort

### Can I hire you for custom development?

Contact the team at partnerships@astralseed.io for:
- Custom integrations
- Enterprise support
- Consulting services
- Training workshops

---

**Still have questions?** 

Open an issue on [GitHub](https://github.com/Adolph-Hughes/AstralSeed/issues) or email info@astralseed.io
