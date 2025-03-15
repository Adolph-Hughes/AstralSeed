# Technical Specification

## Contract Specifications

### BioNFT

**Solidity Version**: 0.8.20  
**Standards**: ERC721, ERC721URIStorage  
**Gas Optimization**: Enabled (200 runs)

#### State Variables
- `_tokenIdCounter`: Counter for sequential token IDs
- `_bioHashes`: Mapping of token ID to bio-hash
- `_institutionIds`: Mapping of token ID to institution
- `_soulboundTokens`: Mapping of soulbound status
- `_bioHashToTokenId`: Reverse mapping for uniqueness check

#### Key Functions
- `mint()`: Mint new bio-NFT (gateway only)
- `setBoulbound()`: Toggle soulbound status
- `getBioHash()`: Retrieve bio-hash for token
- `exists()`: Check token existence

#### Events
- `BioNFTMinted(tokenId, owner, bioHash, institutionId)`
- `SoulboundToggled(tokenId, isSoulbound)`

### MintGateway

**Purpose**: Signature verification and minting orchestration

#### Security Features
- ECDSA signature verification
- Nonce-based replay protection
- Institution validation
- Bio-hash uniqueness enforcement

#### Signature Format
```solidity
keccak256(abi.encodePacked(bioHash, institutionId, minter, nonce))
```

### RestakeVault

**Economic Model**: Time-weighted rewards

#### Reward Calculation
```
rewards = stakedTime * rewardRate * numberOfTokens
```

#### State Management
- Stake tracking per token
- Reward accumulation per user
- Pool balance management

### LicenseManager

**License Types**:
1. **Timed**: Duration-based access
2. **Usage**: Count-limited access
3. **Perpetual**: Unlimited access

#### Pricing Model
Flexible pricing set by NFT owner per license

### RevenueSplitter

**Distribution**:
- NFT Owner: 70%
- Institution: 20%
- Protocol: 10%

**Pattern**: Pull-based withdrawals for security

### MetadataVault

**Encryption**: Off-chain encryption before storage

#### Access Control
- Owner has implicit access
- Granular per-accessor permissions
- Revocable at any time

## Gas Estimates

| Operation | Estimated Gas |
|-----------|--------------|
| Mint BioNFT | ~200,000 |
| Stake NFT | ~80,000 |
| Unstake NFT | ~100,000 |
| Issue License | ~120,000 |
| Distribute Royalty | ~90,000 |
| Grant Access | ~70,000 |
| Register Institution | ~150,000 |

## Security Considerations

### Access Control
- OpenZeppelin AccessControl for roles
- Owner-based restrictions
- Modifier pattern enforcement

### Reentrancy Protection
- ReentrancyGuard on state-changing functions
- Checks-Effects-Interactions pattern
- Pull payment pattern

### Integer Overflow
- Solidity 0.8+ built-in protection
- Explicit overflow checks where needed

### Signature Security
- EIP-191 signed message format
- Nonce uniqueness enforcement
- Signer validation against registry

## Upgrade Path

Current implementation is non-upgradeable.

For future upgrades consider:
- UUPS proxy pattern
- Storage gaps for extensions
- Timelock governance
- Multi-sig requirements

## Network Compatibility

### Supported Networks
- Ethereum Mainnet
- Base (Coinbase L2)
- Base Sepolia (testnet)
- Hardhat local network

### Requirements
- EVM compatible
- Gas limit > 30M per block
- Support for CREATE2
- Standard RPC endpoints

## Dependencies

### External Contracts
- OpenZeppelin Contracts v5.0.0
  - ERC721
  - AccessControl
  - ReentrancyGuard
  - Pausable
  - ERC2981

### Development Tools
- Hardhat 2.19.0
- Ethers.js 6.x
- Chai testing framework
- Hardhat plugins

## Storage Layout

### BioNFT Storage
```
Slot 0: _tokenIdCounter (Counters.Counter)
Slot 1: mintGateway (address)
Slot 2+: _bioHashes mapping
Slot N+: _institutionIds mapping
Slot M+: _soulboundTokens mapping
```

## Event Indexing

### Recommended Indices
- tokenId (indexed in most events)
- owner/staker addresses
- bioHash for minting events
- institutionId for attestations

## Performance Optimization

### Gas Optimization Techniques
1. Use mappings over arrays
2. Pack structs efficiently
3. Cache storage reads
4. Use events for historical data
5. Batch operations where possible

### Query Optimization
- Use view functions for reads
- Implement pagination for lists
- Cache frequently accessed data
- Use subgraphs for complex queries

## Testing Requirements

### Coverage Targets
- Line coverage: >95%
- Branch coverage: >90%
- Function coverage: 100%

### Test Categories
- Unit tests per contract
- Integration tests for workflows
- Fuzz testing for edge cases
- Gas profiling tests
- Security scenario tests

## Deployment Checklist

- [ ] Compile with optimizations
- [ ] Run full test suite
- [ ] Gas profiling
- [ ] Security audit
- [ ] Testnet deployment
- [ ] Contract verification
- [ ] Documentation review
- [ ] Emergency pause plan
- [ ] Upgrade strategy
- [ ] Monitoring setup

## Monitoring

### Key Metrics
- Total NFTs minted
- Active stakes count
- Rewards distributed
- License revenue
- Institution count
- Failed transactions

### Alerts
- Contract paused
- Large withdrawals
- Unusual gas usage
- Failed signature verifications
- Institution deactivations

## Maintenance

### Regular Tasks
- Monitor gas prices
- Review failed transactions
- Update documentation
- Backup event data
- Test emergency procedures

### Emergency Procedures
1. Pause contracts if needed
2. Investigate issue
3. Prepare fix
4. Deploy through governance
5. Resume operations
6. Post-mortem analysis

