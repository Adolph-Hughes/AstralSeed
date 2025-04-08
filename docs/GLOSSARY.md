# AstralSeed Glossary

Comprehensive terminology reference for the AstralSeed protocol.

## A

### Access Control
System for managing permissions and authorizations in smart contracts. AstralSeed uses OpenZeppelin's AccessControl for role-based permissions (ADMIN_ROLE, REGISTRAR_ROLE, etc.).

### Access Key
Encrypted cryptographic key that grants permission to view metadata. Each accessor receives a unique key encrypted specifically for their address.

### Accessor
An address that has been granted permission to view encrypted metadata for a specific bio-NFT. Accessors can be added or removed by the NFT owner.

### Attestation
Digital signature from a verified institution confirming the authenticity and validity of bio-data. Required for minting bio-NFTs through the MintGateway.

### Accumulated Rewards
Total rewards earned by a staker but not yet claimed. Calculated based on staking duration and reward rate.

## B

### Base
Coinbase's Layer 2 network built on Ethereum. Recommended deployment target for AstralSeed due to lower gas fees and fast finality.

### Basis Points (BPS)
Unit of measurement equal to 1/100th of 1%. Used for expressing royalty percentages. Example: 1000 BPS = 10%.

### Batch Operations
Functions that process multiple items in a single transaction, reducing gas costs. Examples: batch minting, batch staking.

### Bio-Data
Biological or genetic data that is tokenized as a bio-NFT. Raw bio-data never goes on-chain; only cryptographic hashes are stored.

### Bio-Hash
Cryptographic hash (keccak256) of biological data, serving as an on-chain commitment without revealing raw data. Format: `bytes32` (32 bytes / 256 bits).

**Example**:
```solidity
bytes32 bioHash = keccak256(abi.encodePacked(biologicalData));
```

### BioNFT
ERC721 token representing ownership of biological data via bio-hash. Core NFT contract in the AstralSeed protocol.

### Block Explorer
Web interface for viewing blockchain transactions and contracts. Examples: BaseScan, Etherscan.

### Burnable
Extension allowing token owners to permanently destroy their NFTs. Implemented in BioNFTBurnable contract.

## C

### Chain ID
Unique identifier for a blockchain network. Examples: Ethereum (1), Base (8453), Base Sepolia (84532).

### Claim
Action of withdrawing accumulated rewards or revenue from a contract. Uses pull payment pattern for security.

### Commitment Scheme
Cryptographic method allowing one to commit to a value while keeping it hidden, with ability to reveal later. Bio-hashes are commitments to biological data.

### Constructor Arguments
Parameters passed when deploying a smart contract. Required for contract initialization and verification.

### Contract Address
Unique blockchain address where a smart contract is deployed. Deterministically generated from deployer address and nonce.

### Coverage
Metric measuring percentage of code tested. Target: >95% line coverage, >90% branch coverage.

## D

### DAO (Decentralized Autonomous Organization)
Governance structure using blockchain voting. Planned for AstralSeed in Q3 2026.

### Deployment
Process of publishing smart contracts to a blockchain network. Irreversible once confirmed.

### Deployment Cost
Gas fees required to deploy contracts. Varies by network and contract complexity.

### Duration
Time period for which a timed license is valid. Measured in seconds on-chain.

## E

### ECDSA (Elliptic Curve Digital Signature Algorithm)
Cryptographic signature scheme used in Ethereum. Used for institution attestations in MintGateway.

**Signature Format**:
```solidity
signature = sign(keccak256(bioHash, institutionId, minter, nonce))
```

### Encrypted Metadata
Biological data encrypted off-chain before storage on IPFS. Only those with access keys can decrypt.

### ERC-721
Ethereum standard for non-fungible tokens (NFTs). BioNFT implements this standard.

### ERC-2981
Ethereum standard for NFT royalty information. Implemented by RevenueSplitter for automatic royalty distribution.

### ERC-4973
Account-bound token standard (soulbound tokens). Optional mode for BioNFT.

### Ethers.js
JavaScript library for interacting with Ethereum. Used throughout AstralSeed scripts and tests.

### Event
Log entry emitted by smart contracts. Indexed for off-chain tracking and analytics.

**Example**:
```solidity
event BioNFTMinted(uint256 indexed tokenId, address indexed owner, bytes32 indexed bioHash);
```

### EVM (Ethereum Virtual Machine)
Runtime environment for smart contracts. AstralSeed is EVM-compatible.

## F

### Faucet
Service providing free testnet tokens. Used to get Base Sepolia ETH for testing.

### FHE (Fully Homomorphic Encryption)
Encryption allowing computation on encrypted data. Planned feature for AstralSeed Q2 2026.

### Forge
Foundry's testing framework. Alternative to Hardhat (not currently used in AstralSeed).

## G

### Gas
Computational cost unit in Ethereum transactions. Paid in ETH or native network token.

**Typical Costs**:
- Mint BioNFT: ~200,000 gas
- Stake: ~80,000 gas
- License: ~120,000 gas

### Gas Limit
Maximum gas allowed for a transaction. Set by sender to prevent runaway costs.

### Gas Price
Cost per unit of gas, measured in gwei (1 gwei = 0.000000001 ETH).

### Governance
Decision-making process for protocol parameters and upgrades. Future DAO governance planned.

### Grant
Action of giving permission to an address. Examples: role grants, metadata access grants.

## H

### Hardhat
Ethereum development environment for compiling, testing, and deploying. Primary development tool for AstralSeed.

### Hardware Wallet
Physical device for secure private key storage. Examples: Ledger, Trezor. Recommended for mainnet operations.

### Hash
Fixed-size output from a cryptographic hash function. Bio-hashes use keccak256.

## I

### Indexed
Event parameter marked for efficient querying. Up to 3 parameters per event can be indexed.

### Institution
Verified research organization authorized to attest to bio-data authenticity. Registered in InstitutionRegistry.

### Institution ID
Unique identifier assigned to registered institutions. Used in attestations and revenue splits.

### Institution Registry
Smart contract managing verified institutions. Controls who can attest to bio-NFTs.

### Integration Test
Test verifying multiple contracts work together correctly. Example: complete mint-to-license workflow.

### IPFS (InterPlanetary File System)
Distributed storage network for files and metadata. Used for storing encrypted bio-data metadata.

**CID Format**: `QmExampleCID123...` (content-addressed identifier)

## K

### Keccak256
Cryptographic hash function used in Ethereum, producing 256-bit hashes. Used for bio-hashes.

```solidity
bytes32 hash = keccak256(abi.encodePacked(data));
```

### Keypair
Pair of cryptographic keys (private and public). Used for signing transactions and attestations.

## L

### Layer 2 (L2)
Scaling solution built on top of Ethereum. Base is an L2 network.

### License
Permission to use bio-data under specific terms. Three types: Timed, Usage-based, Perpetual.

### License ID
Unique identifier for a license. Sequential counter starting from 1.

### License Manager
Smart contract managing bio-data usage licenses. Handles creation, validation, and revocation.

### Licensee
Address that has purchased a license to access bio-data.

### Linter
Tool for analyzing code for potential errors and style issues. Solhint for Solidity, ESLint for JavaScript.

## M

### Mainnet
Live production blockchain network with real value. Examples: Ethereum Mainnet, Base Mainnet.

### Metadata
Additional information about an NFT. For bio-NFTs: encrypted biological data, institution details, etc.

### Metadata Vault
Smart contract managing encrypted metadata storage and access control.

### Migration
Process of moving from old contract version to new version. Requires careful planning.

### Mint
Action of creating a new NFT. In AstralSeed: requires institution attestation.

### Mint Gateway
Smart contract serving as entry point for bio-NFT creation. Verifies signatures and enforces uniqueness.

### Modifier
Solidity keyword for adding preconditions to functions. Examples: `onlyOwner`, `whenNotPaused`.

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}
```

### Multi-sig
Multi-signature wallet requiring multiple approvals for transactions. Recommended for protocol governance.

## N

### NFT (Non-Fungible Token)
Unique digital asset on blockchain. Each bio-NFT is unique and represents specific bio-data.

### Nonce
Number used once to prevent replay attacks. Each mint requires a unique nonce.

**Purpose**: Prevents reusing valid signatures for unauthorized mints.

### Non-custodial
System where users retain control of their assets. Staking in AstralSeed is non-custodial.

## O

### OpenZeppelin
Library of secure, audited smart contract templates. AstralSeed uses OZ extensively.

**Used Contracts**:
- ERC721
- AccessControl
- ReentrancyGuard
- Pausable
- ERC2981

### Oracle
External data provider feeding information to smart contracts. Planned for institution verification.

### Owner
Address with administrative control over a contract. Can be transferred or renounced.

## P

### Pausable
Feature allowing contract owner to halt operations in emergencies. Implemented in BioNFTPausable.

### Pending Rewards
Rewards accumulated but not yet claimed. Visible via `pendingRewards()` function.

### Perpetual License
License with no expiration date. One-time payment for unlimited access.

### Private Key
Secret cryptographic key controlling wallet access. **Never share or commit to git!**

### Protocol Fee
Percentage of revenue allocated to protocol treasury. Default: 10% of license fees.

### Proxy Pattern
Upgrade mechanism using separate logic and storage contracts. Not currently used (contracts are immutable).

### Pull Payment
Withdrawal pattern where recipients claim funds rather than automatic sending. More secure against reentrancy.

```solidity
// Users claim their own funds
function withdraw() external {
    uint256 amount = pendingWithdrawals[msg.sender];
    pendingWithdrawals[msg.sender] = 0;
    payable(msg.sender).transfer(amount);
}
```

## R

### Reentrancy
Attack where external call allows reentry into function. Prevented by ReentrancyGuard.

### Registry
Database of verified entities. InstitutionRegistry stores verified research organizations.

### Replay Attack
Attack reusing valid signature/transaction for unauthorized action. Prevented by nonce system.

### Restaking
Staking NFTs to earn rewards while retaining ownership. Implemented in RestakeVault.

### Revenue Splitter
Contract distributing royalty payments among stakeholders. Implements ERC-2981.

**Default Split**:
- 70% NFT Owner
- 20% Institution
- 10% Protocol

### Reward Rate
Amount earned per second per staked NFT. Measured in wei.

**Example**: `0.0001 ETH per second = 100000000000000 wei/second`

### Revoke
Action of canceling permission. Examples: license revocation, access revocation.

### Role
Permission level in AccessControl system. Examples: ADMIN_ROLE, REGISTRAR_ROLE.

### Royalty
Percentage of sale/license price paid to original creator. Configurable in RevenueSplitter.

## S

### Sepolia
Ethereum testnet for development. Base Sepolia is the testnet for Base network.

### Signature
Cryptographic proof that message was signed by specific private key. Used for attestations.

### Signer
Account (address) that signs transactions or messages. Institutions are signers for attestations.

### Smart Contract
Self-executing code deployed on blockchain. All AstralSeed logic is in smart contracts.

### Solidity
Programming language for Ethereum smart contracts. Version 0.8.20 used in AstralSeed.

### Soulbound Token (SBT)
Non-transferable NFT permanently tied to one address. Optional mode for bio-NFTs.

**Use Case**: Personal identity bio-NFTs that shouldn't be traded.

### Stake
Lock assets in contract to earn rewards. In AstralSeed: lock NFTs to earn from research pools.

### Staking Duration
Time period an NFT has been staked. Used for reward calculation.

## T

### Testnet
Test blockchain network for development. Free tokens from faucets. No real value.

### The Graph
Indexing protocol for blockchain data. Subgraph planned for Q1 2026.

### Timelock
Delay mechanism for governance actions. Allows community to react before changes take effect.

### Token ID
Unique identifier for an NFT within a collection. Sequential counter starting from 1.

### Transaction
State change on blockchain. Requires gas payment and miner/validator confirmation.

### Transaction Receipt
Confirmation record of blockchain transaction. Contains logs, gas used, status.

### Transfer
Moving assets from one address to another. Blocked for soulbound tokens.

## U

### Uniqueness
Property ensuring each bio-hash can only be minted once. Enforced by mapping check.

### Unstake
Withdraw staked NFT from vault. Auto-claims pending rewards.

### Upgrade
Process of deploying new contract version. Current contracts are immutable (no upgrades).

### Usage License
License limited by usage count. Expires after specified number of uses.

### UUPS (Universal Upgradeable Proxy Standard)
Proxy pattern for upgradeable contracts. Considered for future versions.

## V

### Validation
Process of checking data/transaction meets requirements. Examples: signature validation, license validation.

### Vault
Contract holding assets or managing access. Examples: RestakeVault, MetadataVault.

### Verification
Publishing contract source code on block explorer. Makes contracts readable and trustworthy.

### View Function
Function that reads state without modifying it. No gas cost when called externally.

```solidity
function balanceOf(address owner) external view returns (uint256);
```

## W

### Wallet
Software or hardware managing cryptocurrency and NFTs. Examples: MetaMask, Ledger.

### Wei
Smallest unit of Ether. 1 ETH = 10^18 wei.

**Common Units**:
- 1 wei = 1
- 1 gwei = 10^9 wei
- 1 ether = 10^18 wei

### Whitelist
List of approved addresses. Can be used for access control or special privileges.

## Z

### Zero Address
Address `0x0000000000000000000000000000000000000000`. Used to represent "no address" or burns.

### Zero-Knowledge Proof (ZKP)
Cryptographic method proving statement truth without revealing underlying data. Optional feature for bio-hash verification.

### zk-SNARK
Specific type of zero-knowledge proof. "Zero-Knowledge Succinct Non-Interactive Argument of Knowledge". Planned for advanced privacy features.

---

## Contract-Specific Terms

### BioNFT Contract

**Soulbound Mode**: Non-transferable state for personal identity NFTs  
**Bio-Hash Mapping**: `tokenId → bioHash`  
**Institution Attribution**: Each NFT links to attesting institution  
**Duplicate Prevention**: One mint per bio-hash  

### MintGateway Contract

**Nonce System**: Replay protection mechanism  
**Signature Verification**: ECDSA validation of institution attestations  
**Gateway Pattern**: Single entry point for minting  

### RestakeVault Contract

**Non-Custodial Staking**: Users retain NFT ownership  
**Time-Weighted Rewards**: Earnings based on stake duration  
**Pull Rewards**: Users claim their own rewards  

### LicenseManager Contract

**License Types**:
- **Timed**: Duration-based (e.g., 30 days)
- **Usage**: Count-based (e.g., 100 uses)
- **Perpetual**: No expiration

**License Lifecycle**: Issue → Use → Expire/Revoke

### RevenueSplitter Contract

**Revenue Distribution**: Automatic split between owner, institution, protocol  
**ERC-2981 Compliance**: Standard royalty interface  
**Accumulated Balance**: Tracks pending withdrawals per address  

### MetadataVault Contract

**Encrypted Storage**: IPFS CIDs with access control  
**Granular Permissions**: Per-accessor access keys  
**Owner Control**: Grant/revoke access anytime  

### InstitutionRegistry Contract

**Role-Based Access**:
- ADMIN_ROLE: Activate/deactivate institutions
- REGISTRAR_ROLE: Register new institutions

**Attestation Tracking**: Count of attestations per institution  

---

## Development Terms

### Hardhat Terms

**Hardhat Network**: Local Ethereum network for testing  
**Hardhat Console**: Interactive JavaScript console  
**Hardhat Tasks**: Custom CLI commands  

### Testing Terms

**Unit Test**: Test of single function or contract  
**Integration Test**: Test of multiple contracts together  
**Fuzz Test**: Random input testing for edge cases  
**Coverage**: Percentage of code tested  
**Mock**: Fake contract for testing  

### Gas Terms

**Gas Limit**: Maximum gas for transaction  
**Gas Price**: Cost per gas unit  
**Gas Used**: Actual gas consumed  
**Gas Reporter**: Tool showing gas costs  

---

## Acronyms Quick Reference

- **BPS**: Basis Points
- **DAO**: Decentralized Autonomous Organization
- **ECDSA**: Elliptic Curve Digital Signature Algorithm
- **ERC**: Ethereum Request for Comments
- **EVM**: Ethereum Virtual Machine
- **FHE**: Fully Homomorphic Encryption
- **IPFS**: InterPlanetary File System
- **L2**: Layer 2
- **NFT**: Non-Fungible Token
- **SBT**: Soulbound Token
- **UUPS**: Universal Upgradeable Proxy Standard
- **ZKP**: Zero-Knowledge Proof

---

**Note**: This glossary is maintained alongside the codebase. Suggest additions via pull request!

**Related Documentation**:
- Technical Specification: `docs/TECHNICAL_SPEC.md`
- API Reference: `docs/API.md`
- Architecture: `docs/ARCHITECTURE.md`
