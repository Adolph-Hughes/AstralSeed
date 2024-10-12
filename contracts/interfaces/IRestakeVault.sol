// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IRestakeVault
 * @notice Interface for restaking bio-NFTs into research pools
 */
interface IRestakeVault {
    /**
     * @notice Emitted when a bio-NFT is staked
     * @param tokenId The staked token ID
     * @param staker The address of the staker
     * @param timestamp The stake timestamp
     */
    event Staked(uint256 indexed tokenId, address indexed staker, uint256 timestamp);

    /**
     * @notice Emitted when a bio-NFT is unstaked
     * @param tokenId The unstaked token ID
     * @param staker The address of the staker
     * @param timestamp The unstake timestamp
     */
    event Unstaked(uint256 indexed tokenId, address indexed staker, uint256 timestamp);

    /**
     * @notice Emitted when rewards are claimed
     * @param staker The address claiming rewards
     * @param amount The reward amount
     */
    event RewardsClaimed(address indexed staker, uint256 amount);

    /**
     * @notice Stake a bio-NFT into the vault
     * @param tokenId The token ID to stake
     */
    function stake(uint256 tokenId) external;

    /**
     * @notice Unstake a bio-NFT from the vault
     * @param tokenId The token ID to unstake
     */
    function unstake(uint256 tokenId) external;

    /**
     * @notice Claim accumulated rewards
     */
    function claimRewards() external;

    /**
     * @notice Get the staking information for a token
     * @param tokenId The token ID
     * @return staker The address of the staker
     * @return stakedAt The timestamp when staked
     */
    function getStakeInfo(uint256 tokenId) external view returns (address staker, uint256 stakedAt);

    /**
     * @notice Calculate pending rewards for a staker
     * @param staker The staker address
     * @return The pending reward amount
     */
    function pendingRewards(address staker) external view returns (uint256);

    /**
     * @notice Check if a token is currently staked
     * @param tokenId The token ID
     * @return Whether the token is staked
     */
    function isStaked(uint256 tokenId) external view returns (bool);
}

