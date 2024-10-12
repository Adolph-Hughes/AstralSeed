// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title IBioNFT
 * @notice Interface for Bio-Fingerprint NFTs
 * @dev Extends ERC721 with bio-data specific functionality
 */
interface IBioNFT is IERC721 {
    /**
     * @notice Emitted when a new bio-hash NFT is minted
     * @param tokenId The unique identifier of the minted NFT
     * @param owner The address of the NFT owner
     * @param bioHash The cryptographic hash of biological data
     * @param institutionId The ID of the attesting institution
     */
    event BioNFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 indexed bioHash,
        uint256 institutionId
    );

    /**
     * @notice Emitted when soulbound mode is toggled for a token
     * @param tokenId The token ID
     * @param isSoulbound Whether the token is now soulbound
     */
    event SoulboundToggled(uint256 indexed tokenId, bool isSoulbound);

    /**
     * @notice Get the bio-hash associated with a token
     * @param tokenId The token ID
     * @return The bio-hash bytes32 value
     */
    function getBioHash(uint256 tokenId) external view returns (bytes32);

    /**
     * @notice Check if a token is in soulbound mode
     * @param tokenId The token ID
     * @return Whether the token is soulbound
     */
    function isSoulbound(uint256 tokenId) external view returns (bool);

    /**
     * @notice Get the institution ID that attested to a token
     * @param tokenId The token ID
     * @return The institution ID
     */
    function getInstitutionId(uint256 tokenId) external view returns (uint256);

    /**
     * @notice Get the metadata URI for a token
     * @param tokenId The token ID
     * @return The metadata URI string
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

