# AstralSeed Architecture

This document provides a comprehensive overview of the AstralSeed protocol architecture, including contract interactions, data flow, and security considerations.

## System Overview

AstralSeed is a decentralized protocol for tokenizing and managing biological data ownership through bio-fingerprint NFTs. The system consists of seven core smart contracts that work together to provide minting, staking, licensing, and revenue distribution functionality.

## Core Components

### 1. InstitutionRegistry

**Purpose**: Trust anchor for verified research institutions and labs.

**Key Features**:
- Register and manage verified institutions
- Track attestation counts
- Enable/disable institution status
- Role-based access control

**Interactions**:
- Used by MintGateway to verify attestations
- Referenced by RevenueSplitter for royalty distribution

### 2. BioNFT

**Purpose**: ERC721 NFT representing biological data ownership.

**Key Features**:
- Bio-hash storage (cryptographic commitment)
- Optional soulbound mode
- Duplicate prevention
- Institution attribution

**Token Structure**:
```
BioNFT Token:
├── Token ID (unique identifier)
├── Bio-Hash (keccak256 of biological data)
├── Institution ID (attesting institution)
├── Metadata URI (IPFS/Arweave link)
└── Soulbound Status (transferable flag)
```

### 3. MintGateway

**Purpose**: Entry point for NFT minting with signature verification.

**Security Features**:
- ECDSA signature verification
- Nonce-based replay protection
- Institution attestation validation
- Bio-hash uniqueness check

**Minting Flow**:
```
1. Off-chain: Hash biological data → bioHash
2. Off-chain: Institution signs attestation
3. On-chain: User submits mint request
4. Verify: Check signature validity
5. Verify: Check nonce not used
6. Verify: Check institution active
7. Mint: Create BioNFT token
8. Update: Increment institution attestation count
```

### 4. RestakeVault

**Purpose**: Staking mechanism for earning rewards from research participation.

**Economic Model**:
- Stake BioNFTs to earn rewards
- Configurable reward rate per second
- Rewards pool funded by protocol/research partners
- Non-custodial (users retain ownership)

**Staking Lifecycle**:
```
Stake:
1. User approves NFT transfer
2. RestakeVault receives NFT
3. Record stake timestamp
4. Begin reward accumulation

Unstake:
1. Calculate pending rewards
2. Auto-claim rewards
3. Return NFT to user
4. Clear stake record
```

### 5. LicenseManager

**Purpose**: On-chain licensing for bio-data usage rights.

**License Types**:
- **Timed**: Valid for specific duration
- **Usage**: Limited number of uses
- **Perpetual**: No expiration

**Licensing Flow**:
```
1. NFT owner creates license
2. Licensee pays license fee
3. Fee distributed via RevenueSplitter
4. License recorded on-chain
5. Licensee can use data per terms
6. Owner can revoke if needed
```

### 6. RevenueSplitter

**Purpose**: Automated royalty distribution following ERC-2981.

**Distribution Model**:
```
Total Royalty (100%):
├── NFT Owner (70%)
├── Institution (20%)
└── Protocol (10%)
```

**Features**:
- Configurable split percentages
- Pull-based withdrawal pattern
- Accumulated balance tracking
- ERC-2981 compatible

### 7. MetadataVault

**Purpose**: Encrypted metadata storage with granular access control.

**Access Control**:
- Owner has full access by default
- Owner can grant access to specific addresses
- Encrypted keys stored per accessor
- Owner can revoke access anytime

**Data Structure**:
```
Metadata Record:
├── IPFS CID (encrypted data location)
├── Owner Encryption Key
└── Accessor Keys (encrypted for each accessor)
```

## Data Flow Diagrams

### Complete Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    AstralSeed Data Lifecycle                     │
└─────────────────────────────────────────────────────────────────┘

1. MINTING PHASE
   ┌──────────┐     attestation     ┌──────────────────┐
   │ Research │ ──────────────────> │  Institution     │
   │   Lab    │                     │   Registry       │
   └──────────┘                     └──────────────────┘
        │                                    │
        │ signature                          │ verify
        ▼                                    ▼
   ┌──────────┐                      ┌──────────────────┐
   │   User   │ ───── mint ────────> │  MintGateway     │
   └──────────┘                      └──────────────────┘
        │                                    │
        │ receives                           │ mints
        ▼                                    ▼
   ┌──────────────────────────────────────────────┐
   │               BioNFT Token                   │
   └──────────────────────────────────────────────┘

2. METADATA PHASE
   ┌──────────┐     store metadata   ┌──────────────────┐
   │NFT Owner │ ──────────────────> │ MetadataVault    │
   └──────────┘                     └──────────────────┘
        │                                    │
        │ grant access                       │ encrypted
        ▼                                    ▼
   ┌──────────┐                      ┌──────────────────┐
   │ Licensee │ ─────── read ──────> │   IPFS Storage   │
   └──────────┘                      └──────────────────┘

3. STAKING PHASE
   ┌──────────┐     stake NFT        ┌──────────────────┐
   │NFT Owner │ ──────────────────> │  RestakeVault    │
   └──────────┘                     └──────────────────┘
        │                                    │
        │ claim rewards                      │ accumulate
        ▼                                    ▼
   ┌──────────────────────────────────────────────┐
   │            Research Rewards                  │
   └──────────────────────────────────────────────┘

4. LICENSING PHASE
   ┌──────────┐   issue license      ┌──────────────────┐
   │NFT Owner │ ──────────────────> │ LicenseManager   │
   └──────────┘                     └──────────────────┘
        │                                    │
        │                                    │ payment
        ▼                                    ▼
   ┌──────────┐                      ┌──────────────────┐
   │ Licensee │ ───── pays ────────> │ RevenueSplitter  │
   └──────────┘                      └──────────────────┘
                                             │
                         ┌───────────────────┼────────────────┐
                         ▼                   ▼                ▼
                   ┌─────────┐        ┌────────────┐   ┌─────────┐
                   │  Owner  │        │Institution │   │Protocol │
                   │  (70%)  │        │   (20%)    │   │  (10%)  │
                   └─────────┘        └────────────┘   └─────────┘
```

## Security Architecture

### Access Control

```
InstitutionRegistry:
├── DEFAULT_ADMIN_ROLE: Full control
├── ADMIN_ROLE: Activate/deactivate institutions
└── REGISTRAR_ROLE: Register new institutions

BioNFT:
├── Owner: Deploy and configure
└── MintGateway: Authorized minter

RestakeVault:
├── Owner: Configure rewards
└── Users: Stake/unstake own NFTs

LicenseManager:
├── Owner: System configuration
└── Token Owners: Create licenses

RevenueSplitter:
├── Owner: Configure splits
└── Recipients: Withdraw earnings

MetadataVault:
├── Owner: System configuration
└── Token Owners: Manage metadata access
```

### Cryptographic Guarantees

1. **Bio-Hash Integrity**
   - Keccak256 hash of biological data
   - Stored on-chain as commitment
   - Raw data never exposed

2. **Signature Verification**
   - ECDSA signatures from institutions
   - Prevents unauthorized minting
   - Replay protection via nonces

3. **Metadata Encryption**
   - Off-chain encryption before IPFS upload
   - Only encrypted CID stored on-chain
   - Access keys encrypted per recipient

## Gas Optimization

### Storage Patterns

- Use mappings over arrays where possible
- Pack structs to minimize storage slots
- Use events for historical data

### Function Optimization

- Batch operations where applicable
- Use view functions for queries
- Minimize external calls
- Cache storage reads

## Upgradeability Considerations

Current version: **Non-upgradeable**

For production deployment:
- Consider proxy pattern (UUPS or Transparent)
- Use storage gap for future upgrades
- Implement timelock for governance
- Add emergency pause functionality

## Integration Points

### Off-Chain Components

1. **Bio-Hash Generation**
   - Secure enclave for DNA processing
   - Hashing service (keccak256)
   - Zero-knowledge proof generator (optional)

2. **IPFS/Arweave**
   - Metadata storage
   - Encrypted data pinning
   - Content addressing

3. **Indexer (The Graph)**
   - Event indexing
   - Query API
   - Historical data access

4. **Frontend Application**
   - Web3 wallet integration
   - IPFS gateway
   - Institution portal

## Future Enhancements

1. **Fully Homomorphic Encryption (FHE)**
   - Computation on encrypted data
   - Privacy-preserving analysis

2. **Cross-Chain Bridge**
   - Multi-chain NFT support
   - Optimistic rollup integration

3. **DAO Governance**
   - Community-driven decisions
   - Protocol parameter voting
   - Treasury management

4. **NFT Marketplace**
   - License marketplace
   - P2P data licensing
   - Automated pricing models

## Conclusion

AstralSeed provides a robust, secure, and extensible foundation for biological data ownership and monetization. The modular architecture allows for independent upgrades while maintaining system integrity and user privacy.

