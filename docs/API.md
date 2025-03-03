# AstralSeed API Reference

Complete reference documentation for all smart contracts in the AstralSeed protocol.

## Table of Contents

- [InstitutionRegistry](#institutionregistry)
- [BioNFT](#bionft)
- [MintGateway](#mintgateway)
- [RestakeVault](#restakevault)
- [LicenseManager](#licensemanager)
- [RevenueSplitter](#revenuesplitter)
- [MetadataVault](#metadatavault)

---

## InstitutionRegistry

Manages verified research institutions and their attestations.

### Functions

#### registerInstitution

```solidity
function registerInstitution(
    address pubkey,
    string memory name,
    string memory metadata
) external returns (uint256 institutionId)
```

Register a new research institution.

**Access**: `REGISTRAR_ROLE`

**Parameters**:
- `pubkey`: Institution's public key address
- `name`: Institution name
- `metadata`: IPFS CID or metadata JSON

**Returns**: Newly assigned institution ID

**Events**: `InstitutionRegistered(uint256 institutionId, address pubkey, string name)`

#### deactivateInstitution

```solidity
function deactivateInstitution(uint256 institutionId) external
```

Deactivate an institution (prevents new attestations).

**Access**: `ADMIN_ROLE`

#### getInstitution

```solidity
function getInstitution(uint256 institutionId) 
    external 
    view 
    returns (Institution memory)
```

Get institution details.

**Returns**:
```solidity
struct Institution {
    uint256 id;
    string name;
    address pubkey;
    string metadata;
    bool isActive;
    uint256 registeredAt;
    uint256 attestationCount;
}
```

---

## BioNFT

ERC721 NFT representing biological data ownership.

### Functions

#### mint

```solidity
function mint(
    address to,
    bytes32 bioHash,
    uint256 institutionId,
    string memory uri
) external returns (uint256 tokenId)
```

Mint a new bio-NFT (only callable by MintGateway).

**Parameters**:
- `to`: Recipient address
- `bioHash`: Keccak256 hash of biological data
- `institutionId`: Attesting institution ID
- `uri`: Token metadata URI

**Returns**: New token ID

**Events**: `BioNFTMinted(uint256 tokenId, address owner, bytes32 bioHash, uint256 institutionId)`

#### setSoulbound

```solidity
function setSoulbound(uint256 tokenId, bool soulbound) external
```

Toggle soulbound status for a token (owner only).

**Parameters**:
- `tokenId`: Token ID
- `soulbound`: Whether token should be soulbound

#### getBioHash

```solidity
function getBioHash(uint256 tokenId) external view returns (bytes32)
```

Get the bio-hash for a token.

#### isSoulbound

```solidity
function isSoulbound(uint256 tokenId) external view returns (bool)
```

Check if a token is soulbound (non-transferable).

#### getInstitutionId

```solidity
function getInstitutionId(uint256 tokenId) external view returns (uint256)
```

Get the attesting institution ID for a token.

---

## MintGateway

Entry point for NFT minting with signature verification.

### Functions

#### mintBioNFT

```solidity
function mintBioNFT(
    bytes32 bioHash,
    uint256 institutionId,
    string memory metadataURI,
    bytes32 nonce,
    bytes memory signature
) external returns (uint256 tokenId)
```

Mint a new bio-NFT with institution attestation.

**Parameters**:
- `bioHash`: Cryptographic hash of biological data
- `institutionId`: ID of attesting institution
- `metadataURI`: IPFS/Arweave URI for metadata
- `nonce`: Unique nonce (prevents replay)
- `signature`: Institution's ECDSA signature

**Signature Format**:
```solidity
keccak256(abi.encodePacked(bioHash, institutionId, minter, nonce))
```

**Returns**: New token ID

**Events**: `MintRequested(address minter, bytes32 bioHash, uint256 institutionId, uint256 tokenId)`

#### isNonceUsed

```solidity
function isNonceUsed(bytes32 nonce) external view returns (bool)
```

Check if a nonce has been used.

---

## RestakeVault

Staking mechanism for earning rewards from research participation.

### Functions

#### stake

```solidity
function stake(uint256 tokenId) external
```

Stake a bio-NFT to earn rewards.

**Requirements**:
- Caller must own the token
- Token must not already be staked
- Caller must approve vault for token transfer

**Events**: `Staked(uint256 tokenId, address staker, uint256 timestamp)`

#### unstake

```solidity
function unstake(uint256 tokenId) external
```

Unstake a bio-NFT (auto-claims pending rewards).

**Events**: `Unstaked(uint256 tokenId, address staker, uint256 timestamp)`

#### claimRewards

```solidity
function claimRewards() external
```

Claim accumulated rewards without unstaking.

**Events**: `RewardsClaimed(address staker, uint256 amount)`

#### pendingRewards

```solidity
function pendingRewards(address staker) external view returns (uint256)
```

Calculate pending rewards for a staker.

**Formula**: `rewards = stakedTokens * rewardRate * timeStaked`

#### isStaked

```solidity
function isStaked(uint256 tokenId) external view returns (bool)
```

Check if a token is currently staked.

#### getStakedTokens

```solidity
function getStakedTokens(address staker) external view returns (uint256[] memory)
```

Get all staked tokens for an address.

---

## LicenseManager

Manages licensing of bio-data usage rights.

### Types

```solidity
enum LicenseType {
    Timed,      // Time-based license
    Usage,      // Usage-based license
    Perpetual   // Perpetual license
}
```

### Functions

#### issueLicense

```solidity
function issueLicense(
    uint256 tokenId,
    address licensee,
    LicenseType licenseType,
    uint256 duration,
    uint256 usageLimit,
    uint256 price
) external payable returns (uint256 licenseId)
```

Issue a new license for a bio-NFT (token owner only).

**Parameters**:
- `tokenId`: Bio-NFT token ID
- `licensee`: Address receiving the license
- `licenseType`: Type of license
- `duration`: Duration in seconds (for Timed licenses)
- `usageLimit`: Maximum usage count (for Usage licenses)
- `price`: License price in wei

**Payment**: Must send `msg.value >= price`

**Returns**: New license ID

**Events**: `LicenseIssued(uint256 licenseId, uint256 tokenId, address licensee, LicenseType licenseType)`

#### revokeLicense

```solidity
function revokeLicense(uint256 licenseId) external
```

Revoke an existing license (owner or admin only).

#### recordUsage

```solidity
function recordUsage(uint256 licenseId) external
```

Record usage of a license (decrements usage count).

#### isLicenseValid

```solidity
function isLicenseValid(uint256 licenseId) external view returns (bool)
```

Check if a license is currently valid (not expired or exhausted).

#### getLicense

```solidity
function getLicense(uint256 licenseId) external view returns (License memory)
```

Get license details.

---

## RevenueSplitter

Manages programmable royalty distribution (ERC-2981 compatible).

### Functions

#### distributeRoyalty

```solidity
function distributeRoyalty(uint256 tokenId) external payable
```

Distribute royalty payment for a token.

**Distribution**:
- NFT Owner: 70% (configurable)
- Institution: 20% (configurable)
- Protocol: 10% (configurable)

**Payment**: Send royalty amount in `msg.value`

**Events**: `RoyaltyDistributed(uint256 tokenId, uint256 amount, address nftOwner, address institution, address protocol)`

#### withdraw

```solidity
function withdraw() external
```

Withdraw accumulated funds (pull payment pattern).

**Events**: `Withdrawn(address recipient, uint256 amount)`

#### updateShares

```solidity
function updateShares(
    uint96 nftOwner,
    uint96 institution,
    uint96 protocol
) external
```

Update revenue split percentages (owner only).

**Requirement**: `nftOwner + institution + protocol == 10000` (100%)

#### getPendingWithdrawal

```solidity
function getPendingWithdrawal(address account) external view returns (uint256)
```

Get pending withdrawal amount for an address.

#### getShares

```solidity
function getShares() external view returns (uint96, uint96, uint96)
```

Get current share configuration.

---

## MetadataVault

Manages encrypted metadata storage and access control.

### Functions

#### storeMetadata

```solidity
function storeMetadata(
    uint256 tokenId,
    string memory metadataCID,
    bytes memory encryptionKey
) external
```

Store encrypted metadata for a bio-NFT (token owner only).

**Parameters**:
- `tokenId`: Bio-NFT token ID
- `metadataCID`: IPFS CID of encrypted metadata
- `encryptionKey`: Encryption key (encrypted for owner)

**Events**: `MetadataStored(uint256 tokenId, string metadataCID)`

#### grantAccess

```solidity
function grantAccess(
    uint256 tokenId,
    address accessor,
    bytes memory accessKey
) external
```

Grant metadata access to an address (token owner only).

**Parameters**:
- `tokenId`: Bio-NFT token ID
- `accessor`: Address to grant access to
- `accessKey`: Access key (encrypted for accessor)

**Events**: `AccessGranted(uint256 tokenId, address accessor)`

#### revokeAccess

```solidity
function revokeAccess(uint256 tokenId, address accessor) external
```

Revoke metadata access from an address (token owner only).

**Events**: `AccessRevoked(uint256 tokenId, address accessor)`

#### getMetadataCID

```solidity
function getMetadataCID(uint256 tokenId) external view returns (string memory)
```

Get metadata CID (requires access).

**Access**: Token owner or granted accessor

#### hasAccess

```solidity
function hasAccess(uint256 tokenId, address accessor) external view returns (bool)
```

Check if an address has metadata access.

#### getAccessKey

```solidity
function getAccessKey(uint256 tokenId, address accessor) external view returns (bytes memory)
```

Get the access key for an address (requires authorization).

---

## Common Patterns

### Access Control

Most administrative functions use OpenZeppelin's `AccessControl`:

```solidity
// Check if address has role
hasRole(bytes32 role, address account)

// Grant role
grantRole(bytes32 role, address account)

// Revoke role
revokeRole(bytes32 role, address account)
```

### Error Handling

All contracts use `require()` statements with descriptive messages:

```solidity
require(condition, "Error message");
```

Common errors:
- `"Invalid address"`: Zero address provided
- `"Not authorized"`: Caller lacks permission
- `"Already exists"`: Duplicate entry
- `"Does not exist"`: Invalid ID
- `"Not active"`: Resource is deactivated

### Events

All state changes emit events for indexing and monitoring.

### Gas Optimization

- Use `view` functions for read-only operations
- Batch operations where possible
- Cache storage reads in local variables

---

## Integration Examples

### JavaScript/TypeScript (ethers.js v6)

```javascript
const { ethers } = require("ethers");

// Connect to contract
const bioNFT = new ethers.Contract(address, abi, signer);

// Call view function
const bioHash = await bioNFT.getBioHash(tokenId);

// Send transaction
const tx = await bioNFT.setSoulbound(tokenId, true);
await tx.wait();

// Listen to events
bioNFT.on("BioNFTMinted", (tokenId, owner, bioHash, institutionId) => {
  console.log(`NFT ${tokenId} minted to ${owner}`);
});
```

### Web3.py (Python)

```python
from web3 import Web3

# Connect to contract
contract = w3.eth.contract(address=address, abi=abi)

# Call view function
bio_hash = contract.functions.getBioHash(token_id).call()

# Send transaction
tx_hash = contract.functions.setSoulbound(token_id, True).transact()
w3.eth.wait_for_transaction_receipt(tx_hash)
```

---

## Gas Estimates

Approximate gas costs (may vary):

| Operation | Gas Cost |
|-----------|----------|
| Register Institution | ~150,000 |
| Mint BioNFT | ~200,000 |
| Stake NFT | ~80,000 |
| Unstake NFT | ~100,000 |
| Issue License | ~120,000 |
| Grant Access | ~70,000 |

---

## Additional Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Hardhat Documentation](https://hardhat.org/docs)

---

**Last Updated**: 2025-03-25

