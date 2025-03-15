# Security Policy

## Overview

AstralSeed takes security seriously. This document outlines our security policies, best practices, and guidelines for reporting vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

### 1. Bio-Data Privacy

**No Raw Data On-Chain**
- Only cryptographic hashes (bio-hashes) are stored on-chain
- Raw biological data never leaves the user's secure environment
- Metadata is encrypted before IPFS upload

**Access Control**
- Granular permission system for metadata access
- Owner can grant/revoke access at any time
- Encrypted keys per accessor

### 2. Signature Verification

**Institution Attestation**
- ECDSA signature verification for all mints
- Prevents unauthorized NFT creation
- Links NFT to verified institution

**Replay Protection**
- Nonce-based system prevents replay attacks
- Each nonce can only be used once
- Nonces tracked on-chain

### 3. Smart Contract Security

**Access Control**
```solidity
- Role-based permissions (OpenZeppelin AccessControl)
- Owner-only administrative functions
- Modifier-based function protection
```

**Reentrancy Protection**
```solidity
- ReentrancyGuard on all state-changing functions
- Pull payment pattern for withdrawals
- Checks-Effects-Interactions pattern
```

**Integer Overflow Protection**
```solidity
- Solidity 0.8.20+ built-in overflow checks
- SafeMath no longer required
- Explicit type conversions
```

### 4. Token Security

**Soulbound Functionality**
- Optional non-transferable mode for identity NFTs
- Prevents unauthorized transfers
- Owner-controlled toggling

**Duplicate Prevention**
- Each bio-hash can only be minted once
- On-chain uniqueness enforcement
- Prevents double-claiming

### 5. Economic Security

**Reward Distribution**
- Rewards pool segregated from contract logic
- Pull-based withdrawal pattern
- Overflow-safe reward calculations

**Royalty Splits**
- Immutable split percentages (configurable by owner only)
- Atomic distribution transactions
- Accumulated balance tracking

## Known Limitations

### 1. Off-Chain Dependencies

**IPFS/Arweave**
- Metadata availability depends on pinning services
- Recommend redundant pinning
- Consider using Filecoin for persistence

**Institution Signatures**
- Requires secure key management by institutions
- Lost keys cannot be recovered
- Recommend hardware wallets or MPC

### 2. Smart Contract Limitations

**Non-Upgradeable**
- Current contracts are immutable
- Bugs cannot be fixed without redeployment
- Consider proxy pattern for production

**Gas Costs**
- Complex operations may be expensive
- Consider Layer 2 deployment for scale
- Batch operations where possible

## Best Practices

### For Users

1. **Private Key Security**
   - Use hardware wallets for high-value NFTs
   - Never share private keys or seed phrases
   - Enable multi-signature where possible

2. **Metadata Encryption**
   - Encrypt sensitive data before upload
   - Use strong encryption algorithms (AES-256)
   - Store encryption keys securely

3. **Verify Contracts**
   - Always verify contract addresses
   - Check for verified source code on block explorer
   - Beware of phishing sites

### For Institutions

1. **Signature Security**
   - Use HSM or MPC for signing
   - Implement approval workflows
   - Rotate keys periodically

2. **Attestation Verification**
   - Verify biological data authenticity
   - Maintain audit trails
   - Implement quality control

3. **Operational Security**
   - Segregate signing keys from operational keys
   - Monitor for unauthorized signatures
   - Implement incident response plan

### For Developers

1. **Testing**
   - Comprehensive unit tests
   - Integration tests
   - Fuzz testing for edge cases
   - Gas optimization tests

2. **Code Review**
   - Peer review all changes
   - Security-focused code reviews
   - Use static analysis tools

3. **Deployment**
   - Test on testnet extensively
   - Gradual rollout strategy
   - Monitor for anomalies

## Audit Status

**Current Status**: Pre-audit

**Planned Audits**:
- [ ] Internal security review
- [ ] External audit by reputable firm
- [ ] Bug bounty program

## Reporting Vulnerabilities

### Scope

We are interested in vulnerabilities in:
- Smart contracts
- Deployment scripts
- Access control issues
- Economic exploits
- Denial of service attacks

### How to Report

**DO NOT** create public issues for security vulnerabilities.

**Instead:**

1. **Email**: Send details to security@astralseed.io (if available)
2. **PGP**: Use our PGP key for sensitive information
3. **Include**:
   - Detailed description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: 4 weeks

### Disclosure Policy

- Security researchers will be credited (if desired)
- 90-day disclosure timeline after fix
- Coordinated disclosure preferred
- Responsible disclosure rewarded

## Bug Bounty

### Rewards

| Severity | Reward Range |
|----------|-------------|
| Critical | $5,000 - $20,000 |
| High     | $2,000 - $5,000 |
| Medium   | $500 - $2,000 |
| Low      | $100 - $500 |

### Criteria

**Critical**:
- Loss of funds
- Unauthorized minting
- Contract takeover
- Private key exposure

**High**:
- Denial of service
- Access control bypass
- Economic exploits
- Signature forgery

**Medium**:
- Logic errors
- Gas griefing
- Front-running vulnerabilities
- Information disclosure

**Low**:
- Best practice violations
- Code quality issues
- Documentation errors

### Exclusions

Not eligible for rewards:
- Known issues
- Third-party dependencies
- Social engineering
- Denial of service on testnets
- Issues already reported

## Security Contacts

- **Security Email**: security@astralseed.io
- **Emergency Contact**: TBD
- **PGP Key**: TBD

## Updates

This security policy is subject to change. Check back regularly for updates.

**Last Updated**: 2025-03-10

## References

- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/4.x/security)
- [Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Ethereum Security](https://ethereum.org/en/developers/docs/security/)
- [SWC Registry](https://swcregistry.io/)

## Acknowledgments

We appreciate the security research community and responsible disclosure. All legitimate vulnerability reports will be acknowledged and credited.

Thank you for helping keep AstralSeed secure! 🔒

