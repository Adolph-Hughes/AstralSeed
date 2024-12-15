// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BioNFT.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BioNFTPausable
 * @notice Extension adding emergency pause functionality to BioNFT
 * @dev Allows contract owner to pause all transfers in emergency situations
 */
contract BioNFTPausable is BioNFT, Pausable {
    event EmergencyPause(address indexed by, uint256 timestamp);
    event EmergencyUnpause(address indexed by, uint256 timestamp);

    /**
     * @notice Pause all token transfers
     * @dev Only callable by contract owner
     */
    function pause() external onlyOwner {
        _pause();
        emit EmergencyPause(msg.sender, block.timestamp);
    }

    /**
     * @notice Unpause token transfers
     * @dev Only callable by contract owner
     */
    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender, block.timestamp);
    }

    /**
     * @notice Override transfer to check pause status
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override whenNotPaused returns (address) {
        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Check if contract is currently paused
     * @return Whether the contract is paused
     */
    function isPaused() external view returns (bool) {
        return paused();
    }
}

