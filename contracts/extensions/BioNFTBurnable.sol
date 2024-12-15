// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BioNFT.sol";

/**
 * @title BioNFTBurnable
 * @notice Extension adding burn functionality to BioNFT
 * @dev Allows token owners to permanently destroy their bio-NFTs
 */
contract BioNFTBurnable is BioNFT {
    event TokenBurned(uint256 indexed tokenId, address indexed owner, bytes32 indexed bioHash);

    /**
     * @notice Burn (destroy) a bio-NFT token
     * @param tokenId The token ID to burn
     * @dev Only the token owner can burn their token
     */
    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!isSoulbound(tokenId), "Cannot burn soulbound token");
        
        bytes32 bioHash = getBioHash(tokenId);
        
        _burn(tokenId);
        
        emit TokenBurned(tokenId, msg.sender, bioHash);
    }

    /**
     * @notice Batch burn multiple tokens
     * @param tokenIds Array of token IDs to burn
     */
    function burnBatch(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            burn(tokenIds[i]);
        }
    }

    /**
     * @notice Check if a token can be burned
     * @param tokenId The token ID
     * @return Whether the token can be burned
     */
    function canBurn(uint256 tokenId) external view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) return false;
        if (isSoulbound(tokenId)) return false;
        return true;
    }
}

