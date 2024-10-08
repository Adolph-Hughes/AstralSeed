# AstralSeed 🧬

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19.0-orange)](https://hardhat.org/)

**Bio-Data Restaking & Genetic NFT Vault**

A privacy-preserving tokenization and restaking protocol for biological and genetic data.

## Overview

AstralSeed enables institutions and individuals to mint gene-fingerprint NFTs (bio-hash NFTs) that prove ownership of biological data without exposing raw genomic content. NFT holders can restake these assets into research pools, monetization vaults, or licensing agreements.

## Key Features

- **Bio-hash NFT Minting**: Hash DNA/sample signatures without storing raw data on-chain
- **Restaking System**: Stake NFTs into research vaults or computation networks
- **Privacy-First**: Encrypted metadata with optional zk-proof support
- **Licensing Framework**: Programmable royalties and on-chain licensing
- **Institution Registry**: Trust anchor for verified labs and research institutions
- **Revenue Sharing**: Automated distribution between NFT owners, institutions, and protocol

## Architecture

The protocol consists of several interconnected smart contracts:

- **MintGateway**: Entry point for NFT minting with signature validation
- **BioNFT**: ERC721-based bio-fingerprint NFTs with optional soulbound mode
- **RestakeVault**: Staking mechanism for earning rewards from research pools
- **LicenseManager**: On-chain licensing for bio-data usage rights
- **RevenueSplitter**: Programmable royalty distribution (ERC-2981 compatible)
- **MetadataVault**: Encrypted metadata storage with access control
- **InstitutionRegistry**: Verified lab registration and attestation system

## Technology Stack

- Solidity 0.8.20
- Hardhat Development Environment
- OpenZeppelin Contracts
- ERC721, ERC-2981 Standards
- IPFS/Arweave for off-chain storage

## Getting Started

### Installation

```bash
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy

```bash
npm run deploy
```

## Use Cases

- Gene fingerprint NFTs for individuals or research institutions
- Bio-data licensing with programmable royalties
- Restaking into research vaults or computation networks
- Verifiable bio-sample provenance for labs and biotech partners

## Security

- No raw bio-data stored on-chain (only cryptographic commitments)
- zk-hash verification to prevent false claims
- Institution slashing for fraudulent attestations
- Replay-safe minting via nonce mechanism
- Isolated royalty vault architecture

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Documentation

- [API Reference](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Security Policy](./docs/SECURITY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [FAQ](./docs/FAQ.md)
- [Glossary](./docs/GLOSSARY.md)
- [Roadmap](./docs/ROADMAP.md)
- [Technical Specification](./docs/TECHNICAL_SPEC.md)

## Community

- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

## Contact

For questions and support:
- Open an issue on [GitHub](https://github.com/Adolph-Hughes/AstralSeed/issues)
- Email: info@astralseed.io
- Security: security@astralseed.io
