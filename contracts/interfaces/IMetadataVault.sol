// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMetadataVault
 * @notice Interface for encrypted metadata storage with access control
 */
interface IMetadataVault {
    /**
     * @notice Emitted when metadata is stored
     * @param tokenId The bio-NFT token ID
     * @param metadataCID The IPFS CID of encrypted metadata
     */
    event MetadataStored(uint256 indexed tokenId, string metadataCID);

    /**
     * @notice Emitted when metadata access is granted
     * @param tokenId The bio-NFT token ID
     * @param accessor The address granted access
     */
    event AccessGranted(uint256 indexed tokenId, address indexed accessor);

    /**
     * @notice Emitted when metadata access is revoked
     * @param tokenId The bio-NFT token ID
     * @param accessor The address with revoked access
     */
    event AccessRevoked(uint256 indexed tokenId, address indexed accessor);

    /**
     * @notice Store encrypted metadata for a bio-NFT
     * @param tokenId The bio-NFT token ID
     * @param metadataCID The IPFS CID of encrypted metadata
     * @param encryptionKey The encryption key (encrypted for owner)
     */
    function storeMetadata(
        uint256 tokenId,
        string memory metadataCID,
        bytes memory encryptionKey
    ) external;

    /**
     * @notice Grant metadata access to an address
     * @param tokenId The bio-NFT token ID
     * @param accessor The address to grant access to
     * @param accessKey The access key (encrypted for accessor)
     */
    function grantAccess(
        uint256 tokenId,
        address accessor,
        bytes memory accessKey
    ) external;

    /**
     * @notice Revoke metadata access from an address
     * @param tokenId The bio-NFT token ID
     * @param accessor The address to revoke access from
     */
    function revokeAccess(uint256 tokenId, address accessor) external;

    /**
     * @notice Get metadata CID for a token
     * @param tokenId The bio-NFT token ID
     * @return The IPFS CID
     */
    function getMetadataCID(uint256 tokenId) external view returns (string memory);

    /**
     * @notice Check if an address has metadata access
     * @param tokenId The bio-NFT token ID
     * @param accessor The address to check
     * @return Whether the address has access
     */
    function hasAccess(uint256 tokenId, address accessor) external view returns (bool);

    /**
     * @notice Get the access key for an address
     * @param tokenId The bio-NFT token ID
     * @param accessor The address
     * @return The encrypted access key
     */
    function getAccessKey(uint256 tokenId, address accessor) external view returns (bytes memory);
}

