// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./BioNFT.sol";
import "./InstitutionRegistry.sol";

/**
 * @title MintGateway
 * @notice Entry point for minting bio-NFTs with signature verification
 * @dev Validates institution attestations before minting
 */
contract MintGateway is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    BioNFT public bioNFT;
    InstitutionRegistry public institutionRegistry;

    // Mapping to prevent replay attacks
    mapping(bytes32 => bool) public usedNonces;

    event MintRequested(
        address indexed minter,
        bytes32 indexed bioHash,
        uint256 institutionId,
        uint256 tokenId
    );

    constructor(address _bioNFT, address _institutionRegistry) Ownable(msg.sender) {
        require(_bioNFT != address(0), "Invalid BioNFT address");
        require(_institutionRegistry != address(0), "Invalid registry address");
        
        bioNFT = BioNFT(_bioNFT);
        institutionRegistry = InstitutionRegistry(_institutionRegistry);
    }

    /**
     * @notice Mint a new bio-NFT with institution attestation
     * @param bioHash The cryptographic hash of biological data
     * @param institutionId The ID of the attesting institution
     * @param metadataURI The IPFS URI for metadata
     * @param nonce Unique nonce to prevent replay attacks
     * @param signature Institution's signature attesting to the bio-hash
     * @return tokenId The minted token ID
     */
    function mintBioNFT(
        bytes32 bioHash,
        uint256 institutionId,
        string memory metadataURI,
        bytes32 nonce,
        bytes memory signature
    ) external returns (uint256) {
        require(bioHash != bytes32(0), "Invalid bio-hash");
        require(!usedNonces[nonce], "Nonce already used");
        require(
            institutionRegistry.isInstitutionActive(institutionId),
            "Institution not active"
        );

        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(bioHash, institutionId, msg.sender, nonce)
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);

        IInstitutionRegistry.Institution memory institution = 
            institutionRegistry.getInstitution(institutionId);
        require(signer == institution.pubkey, "Invalid signature");

        // Mark nonce as used
        usedNonces[nonce] = true;

        // Mint NFT
        uint256 tokenId = bioNFT.mint(msg.sender, bioHash, institutionId, metadataURI);

        // Increment attestation count
        institutionRegistry.incrementAttestationCount(institutionId);

        emit MintRequested(msg.sender, bioHash, institutionId, tokenId);

        return tokenId;
    }

    /**
     * @notice Update BioNFT contract address
     * @param _bioNFT New BioNFT address
     */
    function setBioNFT(address _bioNFT) external onlyOwner {
        require(_bioNFT != address(0), "Invalid address");
        bioNFT = BioNFT(_bioNFT);
    }

    /**
     * @notice Update InstitutionRegistry contract address
     * @param _institutionRegistry New registry address
     */
    function setInstitutionRegistry(address _institutionRegistry) external onlyOwner {
        require(_institutionRegistry != address(0), "Invalid address");
        institutionRegistry = InstitutionRegistry(_institutionRegistry);
    }

    /**
     * @notice Check if a nonce has been used
     * @param nonce The nonce to check
     * @return Whether the nonce has been used
     */
    function isNonceUsed(bytes32 nonce) external view returns (bool) {
        return usedNonces[nonce];
    }
}

